-- Unified Driver Ledger.
--
-- A driver has ONE account (profiles.driver_balance). Everything that adds
-- debt (fuel, repairs, rentals, penalties) increases it; every payment
-- (fuel_repayment / repair_repayment / rental_repayment) decreases it.
-- Transaction categorization stays granular for the accounting team.

-- 1. Repurpose credit_limit -> weekly_fuel_limit (default R2,000).
alter table public.profiles rename column credit_limit to weekly_fuel_limit;

update public.profiles
set weekly_fuel_limit = 2000
where weekly_fuel_limit is null;

alter table public.profiles
  alter column weekly_fuel_limit set default 2000,
  alter column weekly_fuel_limit set not null;

-- 2. Unified balance + account management columns.
alter table public.profiles
  add column if not exists driver_balance numeric(12,2) not null default 0,
  add column if not exists payment_due_day text not null default 'tuesday'
    check (payment_due_day in ('monday','tuesday','wednesday','thursday','friday')),
  add column if not exists payment_due_time time not null default '13:00',
  add column if not exists payment_arrangement_due_date date,
  add column if not exists payment_arrangement_notes text,
  add column if not exists payment_arrangement_approved_by uuid references public.profiles(id) on delete set null,
  add column if not exists overlimit_count int not null default 0,
  add column if not exists last_penalty_at timestamptz,
  add column if not exists overdue_notification_sent_at timestamptz;

-- 3. Seed driver_balance from the old separate balances.
update public.profiles
set driver_balance = coalesce(fuel_balance, 0) + coalesce(repair_balance, 0);

-- 4. Granular transaction types (no generic payment type).
alter type public.transaction_type add value if not exists 'penalty_fee';
alter type public.transaction_type add value if not exists 'rental_repayment';

-- 5. Over-limit authorization flag on fuel issues.
alter table public.transactions
  add column if not exists authorized_overlimit boolean default false;

-- 6. Fuel cycle helpers (Tue 00:00 -> following Mon 00:00, exclusive).
create or replace function public.fuel_cycle_bounds(as_of timestamptz)
returns table (cycle_start timestamptz, cycle_end timestamptz)
language sql
stable
as $$
  select
    (date_trunc('week', as_of at time zone 'Africa/Johannesburg') + interval '1 day')::date at time zone 'Africa/Johannesburg' as cycle_start,
    (date_trunc('week', as_of at time zone 'Africa/Johannesburg') + interval '7 days')::date at time zone 'Africa/Johannesburg' as cycle_end;
$$;

create or replace function public.driver_weekly_fuel_issued(driver_id uuid, as_of timestamptz default now())
returns numeric
language sql
stable
as $$
  select coalesce(sum(t.amount), 0)
  from public.transactions t
  cross join lateral public.fuel_cycle_bounds(as_of) c
  where t.driver_id = driver_id
    and t.type = 'fuel_issue'
    and t.created_at >= c.cycle_start
    and t.created_at < c.cycle_end;
$$;

create or replace function public.driver_weekly_fuel_issued_litres(driver_id uuid, as_of timestamptz default now())
returns numeric
language sql
stable
as $$
  select coalesce(sum(t.litres), 0)
  from public.transactions t
  cross join lateral public.fuel_cycle_bounds(as_of) c
  where t.driver_id = driver_id
    and t.type = 'fuel_issue'
    and t.created_at >= c.cycle_start
    and t.created_at < c.cycle_end;
$$;

create or replace function public.driver_next_payment_due(p public.profiles)
returns timestamptz
language sql
stable
as $$
  select case
    when p.payment_arrangement_due_date is not null then
      (p.payment_arrangement_due_date + p.payment_due_time) at time zone 'Africa/Johannesburg'
    else
      (select c.cycle_end from public.fuel_cycle_bounds(now()) c)
        + interval '1 day'
        + p.payment_due_time::interval
  end;
$$;

-- 7. Replace the balance trigger (unified, granular categorisation preserved).
create or replace function public.update_profile_balance_on_transaction()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.type in ('fuel_issue', 'repair_issue', 'rental_fee', 'penalty_fee', 'balance_correction_increase') then
    update public.profiles
    set driver_balance = coalesce(driver_balance, 0) + new.amount,
        updated_at = now()
    where id = new.driver_id;

  elsif new.type in ('fuel_repayment', 'repair_repayment', 'rental_repayment', 'balance_correction_decrease') then
    update public.profiles
    set driver_balance = greatest(coalesce(driver_balance, 0) - new.amount, 0),
        updated_at = now()
    where id = new.driver_id;
  end if;

  -- opening_balance is reference-only (existing backfill rows are not double-counted).
  return new;
end;
$$;

drop trigger if exists transactions_update_profile_balance on public.transactions;
create trigger transactions_update_profile_balance
after insert on public.transactions
for each row
execute function public.update_profile_balance_on_transaction();

-- 8. Drop the old separate balance columns.
alter table public.profiles
  drop column if exists fuel_balance,
  drop column if exists repair_balance;

-- 9. Convenience view for dashboards (includes garage name for admin lists).
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

-- 10. Index for cycle-sum performance.
create index if not exists transactions_driver_type_created_idx
  on public.transactions (driver_id, type, created_at);