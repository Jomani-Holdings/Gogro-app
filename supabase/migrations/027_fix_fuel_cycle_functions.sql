-- Fix driver_weekly_fuel_issued / _litres: the parameter name `driver_id`
-- was shadowed by the transactions.driver_id column, so `t.driver_id = driver_id`
-- always evaluated true and every driver received the fleet-wide total.
-- Rename the parameter to p_driver_id to avoid the collision.

drop view if exists public.driver_account_summary;

drop function if exists public.driver_weekly_fuel_issued(uuid, timestamptz);
drop function if exists public.driver_weekly_fuel_issued_litres(uuid, timestamptz);

create function public.driver_weekly_fuel_issued(p_driver_id uuid, as_of timestamptz default now())
returns numeric
language sql
stable
as $$
  select coalesce(sum(t.amount), 0)
  from public.transactions t
  cross join lateral public.fuel_cycle_bounds(as_of) c
  where t.driver_id = p_driver_id
    and t.type = 'fuel_issue'
    and t.created_at >= c.cycle_start
    and t.created_at < c.cycle_end;
$$;

create function public.driver_weekly_fuel_issued_litres(p_driver_id uuid, as_of timestamptz default now())
returns numeric
language sql
stable
as $$
  select coalesce(sum(t.litres), 0)
  from public.transactions t
  cross join lateral public.fuel_cycle_bounds(as_of) c
  where t.driver_id = p_driver_id
    and t.type = 'fuel_issue'
    and t.created_at >= c.cycle_start
    and t.created_at < c.cycle_end;
$$;

create or replace view public.driver_account_summary as
select
  p.id,
  p.user_id,
  p.full_name,
  p.email,
  p.phone,
  p.role,
  p.suspended,
  p.driver_status,
  p.car_make_model,
  p.car_registration,
  p.id_number,
  p.suburb,
  p.license_valid,
  p.years_experience,
  p.preferred_vehicle_category,
  p.marketing_source,
  p.primary_service,
  p.weekly_fuel_limit,
  p.driver_balance,
  p.fuel_code,
  p.fuel_garage_id,
  g.name as fuel_garage_name,
  p.payment_due_day,
  p.payment_due_time,
  p.payment_arrangement_due_date,
  p.payment_arrangement_notes,
  p.overlimit_count,
  p.created_at,
  public.driver_weekly_fuel_issued(p.id, now()) as weekly_fuel_issued,
  public.driver_weekly_fuel_issued_litres(p.id, now()) as weekly_fuel_issued_litres,
  p.weekly_fuel_limit - public.driver_weekly_fuel_issued(p.id, now()) as weekly_fuel_available,
  public.driver_next_payment_due(p) as next_payment_due,
  (p.driver_balance > 0 and now() > public.driver_next_payment_due(p)) as is_overdue
from public.profiles p
left join public.garages g on g.id = p.fuel_garage_id;