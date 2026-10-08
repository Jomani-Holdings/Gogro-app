-- Categorical driver balances.
--
-- Migration 023 unified all driver debt into profiles.driver_balance and
-- dropped the separate fuel_balance / repair_balance columns. The activity
-- rules (Monday fuel-debt freeze) and the client finance breakdown need fast
-- access to the per-category outstanding amounts, so we re-introduce them and
-- keep them in sync with the ledger via the existing transaction trigger.

-- 1. Category balance columns.
alter table public.profiles
  add column if not exists fuel_balance numeric(12,2) not null default 0,
  add column if not exists repair_balance numeric(12,2) not null default 0,
  add column if not exists rental_balance numeric(12,2) not null default 0,
  add column if not exists penalty_balance numeric(12,2) not null default 0;

-- 2. Backfill from the ledger (clamped to outstanding debt, never negative).
update public.profiles p
set
  fuel_balance = greatest(coalesce((
    select sum(case
      when t.type = 'fuel_issue' then t.amount
      when t.type = 'fuel_repayment' then -t.amount
      else 0 end)
    from public.transactions t
    where t.driver_id = p.id
  ), 0), 0),
  repair_balance = greatest(coalesce((
    select sum(case
      when t.type = 'repair_issue' then t.amount
      when t.type = 'repair_repayment' then -t.amount
      else 0 end)
    from public.transactions t
    where t.driver_id = p.id
  ), 0), 0),
  rental_balance = greatest(coalesce((
    select sum(case
      when t.type = 'rental_fee' then t.amount
      when t.type = 'rental_repayment' then -t.amount
      else 0 end)
    from public.transactions t
    where t.driver_id = p.id
  ), 0), 0),
  penalty_balance = greatest(coalesce((
    select sum(case
      when t.type = 'penalty_fee' then t.amount
      when t.type = 'balance_correction_increase' then t.amount
      when t.type = 'balance_correction_decrease' then -t.amount
      else 0 end)
    from public.transactions t
    where t.driver_id = p.id
  ), 0), 0);

-- 3. Maintain the category balances on every ledger row, alongside the
--    unified driver_balance.
create or replace function public.update_profile_balance_on_transaction()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.type = 'fuel_issue' then
    update public.profiles
    set driver_balance = coalesce(driver_balance, 0) + new.amount,
        fuel_balance = coalesce(fuel_balance, 0) + new.amount,
        updated_at = now()
    where id = new.driver_id;
  elsif new.type = 'repair_issue' then
    update public.profiles
    set driver_balance = coalesce(driver_balance, 0) + new.amount,
        repair_balance = coalesce(repair_balance, 0) + new.amount,
        updated_at = now()
    where id = new.driver_id;
  elsif new.type = 'rental_fee' then
    update public.profiles
    set driver_balance = coalesce(driver_balance, 0) + new.amount,
        rental_balance = coalesce(rental_balance, 0) + new.amount,
        updated_at = now()
    where id = new.driver_id;
  elsif new.type = 'penalty_fee' then
    update public.profiles
    set driver_balance = coalesce(driver_balance, 0) + new.amount,
        penalty_balance = coalesce(penalty_balance, 0) + new.amount,
        updated_at = now()
    where id = new.driver_id;
  elsif new.type = 'balance_correction_increase' then
    update public.profiles
    set driver_balance = coalesce(driver_balance, 0) + new.amount,
        penalty_balance = coalesce(penalty_balance, 0) + new.amount,
        updated_at = now()
    where id = new.driver_id;
  elsif new.type = 'fuel_repayment' then
    update public.profiles
    set driver_balance = greatest(coalesce(driver_balance, 0) - new.amount, 0),
        fuel_balance = greatest(coalesce(fuel_balance, 0) - new.amount, 0),
        updated_at = now()
    where id = new.driver_id;
  elsif new.type = 'repair_repayment' then
    update public.profiles
    set driver_balance = greatest(coalesce(driver_balance, 0) - new.amount, 0),
        repair_balance = greatest(coalesce(repair_balance, 0) - new.amount, 0),
        updated_at = now()
    where id = new.driver_id;
  elsif new.type = 'rental_repayment' then
    update public.profiles
    set driver_balance = greatest(coalesce(driver_balance, 0) - new.amount, 0),
        rental_balance = greatest(coalesce(rental_balance, 0) - new.amount, 0),
        updated_at = now()
    where id = new.driver_id;
  elsif new.type = 'balance_correction_decrease' then
    update public.profiles
    set driver_balance = greatest(coalesce(driver_balance, 0) - new.amount, 0),
        penalty_balance = greatest(coalesce(penalty_balance, 0) - new.amount, 0),
        updated_at = now()
    where id = new.driver_id;
  end if;

  -- opening_balance is reference-only (unchanged from migration 023).
  return new;
end;
$$;

drop trigger if exists transactions_update_profile_balance on public.transactions;
create trigger transactions_update_profile_balance
after insert on public.transactions
for each row
execute function public.update_profile_balance_on_transaction();

-- 4. Expose the category balances through the dashboard view.
drop view if exists public.driver_account_summary;

create view public.driver_account_summary as
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
  p.fuel_balance,
  p.repair_balance,
  p.rental_balance,
  p.penalty_balance,
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
