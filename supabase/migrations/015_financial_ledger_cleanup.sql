-- Phase 8: Financial ledger cleanup + vehicle ownership type.
--
-- Adds ledger types for opening balances and manual corrections, introduces a
-- proper vehicle ownership enum, and updates the balance trigger.
--
-- NOTE: new enum values added here cannot be *used* in the same transaction,
-- so the opening-balance backfill lives in 016_backfill_opening_balances.sql.

-- 1. New transaction types.
alter type public.transaction_type add value if not exists 'opening_balance';
alter type public.transaction_type add value if not exists 'balance_correction_increase';
alter type public.transaction_type add value if not exists 'balance_correction_decrease';

-- 2. Vehicle ownership enum + column.
create type public.vehicle_ownership as enum ('own', 'rental', 'managed');

alter table public.vehicles
  add column if not exists ownership_type public.vehicle_ownership not null default 'managed';

-- Seed ownership from the legacy free-text category convention.
update public.vehicles
set ownership_type = case
  when lower(coalesce(category, '')) = 'rental' then 'rental'::public.vehicle_ownership
  else 'managed'::public.vehicle_ownership
end;

create index if not exists vehicles_ownership_idx
  on public.vehicles (ownership_type);

-- 3. Update the balance trigger to handle the new ledger types.
create or replace function public.update_profile_balance_on_transaction()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.type = 'fuel_issue' then
    update public.profiles
    set fuel_balance = fuel_balance + new.amount,
        updated_at = now()
    where id = new.driver_id;
  elsif new.type = 'repair_issue' then
    update public.profiles
    set repair_balance = repair_balance + new.amount,
        updated_at = now()
    where id = new.driver_id;
  elsif new.type = 'fuel_repayment' then
    update public.profiles
    set fuel_balance = greatest(fuel_balance - new.amount, 0),
        updated_at = now()
    where id = new.driver_id;
  elsif new.type = 'repair_repayment' then
    update public.profiles
    set repair_balance = greatest(repair_balance - new.amount, 0),
        updated_at = now()
    where id = new.driver_id;
  elsif new.type = 'balance_correction_increase' then
    update public.profiles
    set fuel_balance = fuel_balance + new.amount,
        updated_at = now()
    where id = new.driver_id;
  elsif new.type = 'balance_correction_decrease' then
    update public.profiles
    set fuel_balance = greatest(fuel_balance - new.amount, 0),
        updated_at = now()
    where id = new.driver_id;
  end if;
  -- opening_balance and rental_fee do not change balances.
  return new;
end;
$$;