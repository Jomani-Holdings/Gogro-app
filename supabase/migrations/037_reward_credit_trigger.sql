-- Reward credit balance handling.
--
-- Split from migration 036 on purpose: PostgreSQL will not let a transaction
-- use an enum value that was added in the same transaction. 036 commits the
-- new `reward_credit` value; this migration can then reference it safely.
--
-- reward_credit REDUCES the driver and fuel balances and is allowed to take
-- them negative. A negative fuel balance means the driver holds credit that
-- can be spent at the pump.

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
  elsif new.type = 'reward_credit' then
    -- Intentionally allows a negative balance: a credit the driver can spend.
    update public.profiles
    set driver_balance = coalesce(driver_balance, 0) - new.amount,
        fuel_balance = coalesce(fuel_balance, 0) - new.amount,
        updated_at = now()
    where id = new.driver_id;
  end if;

  return new;
end;
$$;

drop trigger if exists transactions_update_profile_balance on public.transactions;
create trigger transactions_update_profile_balance
after insert on public.transactions
for each row
execute function public.update_profile_balance_on_transaction();
