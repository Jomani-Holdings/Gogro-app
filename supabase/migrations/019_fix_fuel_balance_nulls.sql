-- Fix fuel_balance handling: NULL values caused the balance trigger to compute
-- NULL + amount = NULL, so fuel issues never increased the balance (repair
-- worked because repair_balance has NOT NULL DEFAULT 0).

-- 1. Backfill existing NULL fuel balances.
update public.profiles
set fuel_balance = 0
where fuel_balance is null;

-- 2. Enforce the same NOT NULL DEFAULT 0 as repair_balance so future ledger
--    arithmetic never starts from NULL.
alter table public.profiles
  alter column fuel_balance set default 0;

alter table public.profiles
  alter column fuel_balance set not null;

-- 3. Make the balance trigger resilient to NULLs with COALESCE.
create or replace function public.update_profile_balance_on_transaction()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.type = 'fuel_issue' then
    update public.profiles
    set fuel_balance = coalesce(fuel_balance, 0) + new.amount,
        updated_at = now()
    where id = new.driver_id;
  elsif new.type = 'repair_issue' then
    update public.profiles
    set repair_balance = coalesce(repair_balance, 0) + new.amount,
        updated_at = now()
    where id = new.driver_id;
  elsif new.type = 'fuel_repayment' then
    update public.profiles
    set fuel_balance = greatest(coalesce(fuel_balance, 0) - new.amount, 0),
        updated_at = now()
    where id = new.driver_id;
  elsif new.type = 'repair_repayment' then
    update public.profiles
    set repair_balance = greatest(coalesce(repair_balance, 0) - new.amount, 0),
        updated_at = now()
    where id = new.driver_id;
  elsif new.type = 'balance_correction_increase' then
    update public.profiles
    set fuel_balance = coalesce(fuel_balance, 0) + new.amount,
        updated_at = now()
    where id = new.driver_id;
  elsif new.type = 'balance_correction_decrease' then
    update public.profiles
    set fuel_balance = greatest(coalesce(fuel_balance, 0) - new.amount, 0),
        updated_at = now()
    where id = new.driver_id;
  end if;
  -- opening_balance and rental_fee do not change balances.
  return new;
end;
$$;