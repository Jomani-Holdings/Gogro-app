-- Manual points economy for the Driver Rewards programme.
--
-- Points are awarded by an admin when logging a repayment. They are kept
-- completely separate from the Rand ledger: points live on `profiles`, while
-- `transactions` only records how many points a repayment earned. A
-- `reward_credit` Rand transaction is created only when points are redeemed
-- for Fuel Credit (see migration 039).

-- 1. Points earned on a ledger row (admin-entered, defaults to 0).
alter table public.transactions
  add column if not exists points_earned integer not null default 0
    check (points_earned >= 0);

-- 2. Cached point totals + streak + referral code on the driver.
alter table public.profiles
  add column if not exists points_balance integer not null default 0
    check (points_balance >= 0),
  add column if not exists lifetime_points_earned integer not null default 0
    check (lifetime_points_earned >= 0),
  add column if not exists lifetime_points_redeemed integer not null default 0
    check (lifetime_points_redeemed >= 0),
  add column if not exists current_streak integer not null default 0
    check (current_streak >= 0),
  add column if not exists referral_code text;

-- 3. Referral codes. GOGRO-XXXXXX, unique, generated for existing and new
--    drivers.
create or replace function public.generate_referral_code()
returns text
language plpgsql
as $$
declare
  candidate text;
begin
  loop
    candidate := 'GOGRO-' || upper(substr(md5(gen_random_uuid()::text), 1, 6));
    exit when not exists (
      select 1 from public.profiles where referral_code = candidate
    );
  end loop;
  return candidate;
end;
$$;

do $$
declare
  rec record;
begin
  for rec in
    select id from public.profiles
    where referral_code is null or referral_code = ''
  loop
    update public.profiles
    set referral_code = public.generate_referral_code()
    where id = rec.id;
  end loop;
end $$;

alter table public.profiles alter column referral_code set not null;

create unique index if not exists profiles_referral_code_key
  on public.profiles (referral_code);

create or replace function public.set_profile_referral_code()
returns trigger
language plpgsql
as $$
begin
  if new.referral_code is null or new.referral_code = '' then
    new.referral_code := public.generate_referral_code();
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_set_referral_code on public.profiles;
create trigger profiles_set_referral_code
before insert on public.profiles
for each row
execute function public.set_profile_referral_code();

-- 4. Referral progress tracking.
alter table public.driver_referrals
  add column if not exists weeks_paid integer not null default 0
    check (weeks_paid >= 0),
  add column if not exists points_earned integer not null default 0
    check (points_earned >= 0),
  add column if not exists last_payment_at timestamptz;

-- 5. Point-purchasable reward catalog.
alter table public.rewards
  add column if not exists point_cost integer
    check (point_cost is null or point_cost >= 0),
  add column if not exists point_reward_type text
    check (point_reward_type in (
      'fuel_credit',
      'cash_reward',
      'tyre_voucher',
      'service_voucher'
    ));

-- 6. Redemption tracking on claims.
alter table public.reward_claims
  add column if not exists points_redeemed integer not null default 0
    check (points_redeemed >= 0);

-- 7. Trigger: when a repayment row carries points, credit the driver once.
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

  -- Points are independent of the Rand movement and may be attached to any
  -- repayment row.
  if new.points_earned > 0 then
    update public.profiles
    set points_balance = coalesce(points_balance, 0) + new.points_earned,
        lifetime_points_earned = coalesce(lifetime_points_earned, 0) + new.points_earned,
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

-- 8. Expose points/streak/referral fields through the dashboard view.
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
  p.membership_tier,
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
  (p.driver_balance > 0 and now() > public.driver_next_payment_due(p)) as is_overdue,
  p.points_balance,
  p.lifetime_points_earned,
  p.lifetime_points_redeemed,
  p.current_streak,
  p.referral_code
from public.profiles p
left join public.garages g on g.id = p.fuel_garage_id;
