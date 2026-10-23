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

-- 7. Deletion-aware balance trigger, now also handling points.
--    Keeps the soft-delete/restore behaviour from migration 040 intact.
create or replace function public.update_profile_balance_on_transaction()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_ref_type text;
  v_ref_points integer;
begin
  if new.restores_transaction_id is not null then
    select type::text, points_earned
      into v_ref_type, v_ref_points
    from public.transactions
    where id = new.restores_transaction_id;

    if v_ref_type is not null then
      perform public.apply_transaction_effect(new.driver_id, v_ref_type, new.amount);
    end if;

    if coalesce(v_ref_points, 0) > 0 then
      update public.profiles
      set points_balance = coalesce(points_balance, 0) + v_ref_points,
          lifetime_points_earned = coalesce(lifetime_points_earned, 0) + v_ref_points,
          updated_at = now()
      where id = new.driver_id;
    end if;

    return new;
  end if;

  if new.reverses_transaction_id is not null then
    select type::text, points_earned
      into v_ref_type, v_ref_points
    from public.transactions
    where id = new.reverses_transaction_id;

    if v_ref_type is not null then
      perform public.negate_transaction_effect(new.driver_id, v_ref_type, new.amount);
    end if;

    if coalesce(v_ref_points, 0) > 0 then
      update public.profiles
      set points_balance = greatest(coalesce(points_balance, 0) - v_ref_points, 0),
          lifetime_points_earned = greatest(coalesce(lifetime_points_earned, 0) - v_ref_points, 0),
          updated_at = now()
      where id = new.driver_id;
    end if;

    return new;
  end if;

  perform public.apply_transaction_effect(new.driver_id, new.type::text, new.amount);

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

-- 7b. Recreate the active ledger view so it exposes points_earned. The view
--     was created in 040 before this column existed, and `t.*` only expands
--     at creation time.
drop view if exists public.active_transactions;
create view public.active_transactions
with (security_invoker = true) as
select
  t.*,
  v.make_model as vehicle_name,
  g.name as garage_name,
  p.full_name as driver_name
from public.transactions t
left join public.vehicles v on v.id = t.vehicle_id
left join public.garages g on g.id = t.garage_id
left join public.profiles p on p.id = t.driver_id
where t.reverses_transaction_id is null
  and t.restores_transaction_id is null
  and not exists (
    select 1
    from public.transaction_deletions d
    where d.transaction_id = t.id
      and d.restored_at is null
  );

grant select on public.active_transactions to authenticated, service_role;

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
