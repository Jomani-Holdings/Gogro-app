-- P1 dashboard aggregations.
--
-- Live debt is read from profiles (kept correct by the ledger trigger).
-- Historical all-time totals live in a materialized view refreshed by pg_cron,
-- so dashboard reads never scan the whole ledger and transactions never contend
-- on a single summary row.

create materialized view if not exists public.mv_platform_historical_stats as
select
  1 as id,
  coalesce(sum(amount) filter (where type = 'fuel_issue'), 0) as fuel_issued,
  coalesce(sum(amount) filter (where type = 'fuel_repayment'), 0) as fuel_repaid,
  coalesce(sum(amount) filter (where type = 'repair_issue'), 0) as repair_issued,
  coalesce(sum(amount) filter (where type = 'repair_repayment'), 0) as repair_repaid,
  coalesce(sum(amount) filter (where type = 'rental_fee'), 0) as rental_issued,
  coalesce(sum(amount) filter (where type = 'rental_repayment'), 0) as rental_repaid,
  coalesce(sum(amount) filter (where type = 'penalty_fee'), 0) as penalty_issued,
  coalesce(sum(amount) filter (where type = 'balance_correction_increase'), 0) as correction_increase,
  coalesce(sum(amount) filter (where type = 'balance_correction_decrease'), 0) as correction_decrease
from public.active_transactions;

create unique index if not exists mv_platform_historical_stats_id_idx
  on public.mv_platform_historical_stats (id);

create or replace function public.refresh_platform_historical_stats()
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  refresh materialized view concurrently public.mv_platform_historical_stats;
end;
$$;

revoke all on function public.refresh_platform_historical_stats() from public;
grant execute on function public.refresh_platform_historical_stats() to service_role;

-- Schedule a refresh every 15 minutes when pg_cron is available. On projects
-- without pg_cron the dashboard still works; the view just stays at its last
-- refresh until a deployment/cron calls the RPC.
do $$
begin
  begin
    execute 'create extension if not exists pg_cron';
  exception when others then
    raise notice 'pg_cron is unavailable; skipping platform stats schedule: %', sqlerrm;
    return;
  end;

  declare
    v_job_id bigint;
  begin
    select jobid into v_job_id
    from cron.job
    where jobname = 'refresh-platform-stats'
    limit 1;

    if v_job_id is not null then
      perform cron.unschedule(v_job_id);
    end if;

    perform cron.schedule(
      'refresh-platform-stats',
      '*/15 * * * *',
      'select public.refresh_platform_historical_stats();'
    );
  end;
end;
$$;

create or replace function public.admin_dashboard_stats()
returns jsonb
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  with cycle as (
    select cycle_start, cycle_end from public.fuel_cycle_bounds(now())
  ),
  cycle_fuel as (
    select
      coalesce(sum(t.amount), 0) as amount,
      coalesce(sum(t.litres), 0) as litres
    from public.active_transactions t
    cross join cycle c
    where t.type = 'fuel_issue'
      and t.created_at >= c.cycle_start
      and t.created_at < c.cycle_end
  ),
  over_limit as (
    select count(*)::int as cnt
    from (
      select t.driver_id, sum(t.amount) as amount
      from public.active_transactions t
      cross join cycle c
      where t.type = 'fuel_issue'
        and t.created_at >= c.cycle_start
        and t.created_at < c.cycle_end
      group by t.driver_id
    ) issued
    join public.profiles p on p.id = issued.driver_id
    where issued.amount > p.weekly_fuel_limit
  ),
  vehicles as (
    select
      count(*) filter (where ownership_type = 'managed')::int as managed,
      count(*) filter (where ownership_type = 'rental')::int as rental
    from public.vehicles
    where status = 'active'
  ),
  drivers as (
    select
      count(*)::int as active,
      coalesce(sum(driver_balance), 0) as outstanding
    from public.profiles
    where role = 'client'
  ),
  overdue as (
    select count(*)::int as cnt
    from public.profiles p
    where p.role = 'client'
      and p.driver_balance > 0
      and now() > public.driver_next_payment_due(p)
  ),
  historical as (
    select
      fuel_issued + repair_issued + rental_issued + penalty_issued as total_issued,
      fuel_repaid + repair_repaid + rental_repaid as total_repaid
    from public.mv_platform_historical_stats
    where id = 1
  )
  select jsonb_build_object(
    'activeDrivers', drivers.active,
    'fuelIssuedThisCycle', jsonb_build_object(
      'amount', cycle_fuel.amount,
      'litres', cycle_fuel.litres
    ),
    'totalOutstanding', drivers.outstanding,
    'repaymentRate', case
      when historical.total_issued > 0
        then round((historical.total_repaid / historical.total_issued) * 100)::int
      else 0
    end,
    'overdueAccounts', overdue.cnt,
    'accountsOverLimit', over_limit.cnt,
    'vehiclesUnderManagement', vehicles.managed,
    'rentalVehicles', vehicles.rental
  )
  from drivers, cycle_fuel, over_limit, vehicles, overdue, historical;
$$;

revoke all on function public.admin_dashboard_stats() from public;
grant execute on function public.admin_dashboard_stats() to service_role;

create or replace function public.admin_top_debtors(p_limit int default 5)
returns jsonb
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'id', d.id,
        'full_name', d.full_name,
        'driver_balance', d.driver_balance,
        'total_balance', d.driver_balance
      )
      order by d.driver_balance desc
    ),
    '[]'::jsonb
  )
  from (
    select id, full_name, driver_balance
    from public.profiles
    where role = 'client'
      and driver_balance > 0
    order by driver_balance desc
    limit greatest(p_limit, 0)
  ) d;
$$;

revoke all on function public.admin_top_debtors(int) from public;
grant execute on function public.admin_top_debtors(int) to service_role;

create or replace function public.admin_fuel_usage_by_garage()
returns jsonb
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  with cycle as (
    select cycle_start, cycle_end from public.fuel_cycle_bounds(now())
  ),
  usage as (
    select
      t.garage_id,
      coalesce(g.name, 'Unassigned') as garage_name,
      sum(t.litres) as litres,
      sum(t.amount) as amount
    from public.active_transactions t
    cross join cycle c
    left join public.garages g on g.id = t.garage_id
    where t.type = 'fuel_issue'
      and t.created_at >= c.cycle_start
      and t.created_at < c.cycle_end
    group by t.garage_id, g.name
  )
  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'garage_id', garage_id,
        'garage_name', garage_name,
        'litres', litres,
        'amount', amount
      )
      order by litres desc
    ),
    '[]'::jsonb
  )
  from usage;
$$;

revoke all on function public.admin_fuel_usage_by_garage() from public;
grant execute on function public.admin_fuel_usage_by_garage() to service_role;

create or replace function public.admin_active_drivers_for_dashboard(
  p_limit int default 20
)
returns jsonb
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  with month_bounds as (
    select date_trunc('month', now() at time zone 'Africa/Johannesburg')
      at time zone 'Africa/Johannesburg' as month_start
  ),
  fuel as (
    select t.driver_id, sum(t.litres) as litres
    from public.active_transactions t
    cross join month_bounds m
    where t.type = 'fuel_issue'
      and t.created_at >= m.month_start
    group by t.driver_id
  ),
  drivers as (
    select
      d.id,
      d.full_name,
      d.email,
      d.driver_balance,
      d.weekly_fuel_limit,
      d.weekly_fuel_issued,
      d.next_payment_due,
      d.is_overdue,
      fuel.litres as fuel_used_this_month
    from public.driver_account_summary d
    left join fuel on fuel.driver_id = d.id
    where d.role = 'client'
      and d.driver_status = 'active'
    order by d.driver_balance desc
    limit greatest(p_limit, 0)
  )
  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'id', d.id,
        'full_name', d.full_name,
        'email', d.email,
        'driver_balance', d.driver_balance,
        'vehicle', (
          select jsonb_build_object(
            'id', v.id,
            'make_model', v.make_model,
            'registration', v.registration
          )
          from public.vehicles v
          where v.driver_id = d.id
            and v.status = 'active'
          order by v.created_at desc
          limit 1
        ),
        'fuel_used_this_month', coalesce(d.fuel_used_this_month, 0),
        'weekly_fuel_limit', d.weekly_fuel_limit,
        'weekly_fuel_issued', d.weekly_fuel_issued,
        'next_payment_due', d.next_payment_due,
        'is_overdue', d.is_overdue
      )
      order by d.driver_balance desc
    ),
    '[]'::jsonb
  )
  from drivers d;
$$;

revoke all on function public.admin_active_drivers_for_dashboard(int) from public;
grant execute on function public.admin_active_drivers_for_dashboard(int) to service_role;

create or replace function public.admin_repair_stats(p_driver_ids uuid[])
returns table (
  driver_id uuid,
  total_repair_repaid numeric,
  last_repair_at timestamptz
)
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select
    t.driver_id,
    coalesce(sum(t.amount) filter (where t.type = 'repair_repayment'), 0) as total_repair_repaid,
    max(t.created_at) as last_repair_at
  from public.active_transactions t
  where t.driver_id = any(p_driver_ids)
    and t.type in ('repair_issue', 'repair_repayment')
  group by t.driver_id;
$$;

revoke all on function public.admin_repair_stats(uuid[]) from public;
grant execute on function public.admin_repair_stats(uuid[]) to service_role;
