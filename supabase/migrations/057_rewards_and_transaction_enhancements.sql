-- Rewards + transaction enhancements.
--
--   1. Allow rewards to be published immediately (status 'published').
--   2. Add an optional, display-only service fee on fuel repayments. The fee is
--      recorded for transparency/accounting but never changes the driver's
--      balances (balances continue to move by `amount` only).
--   3. Streak milestone redemptions (5/10/15/20 weeks, 100 pts each) handled by
--      an atomic RPC. Tracked per streak cycle so a driver can claim the same
--      milestone again after their streak resets.

-- ---------------------------------------------------------------------------
-- 1. Reward status: add 'published' to the allowed values.
-- ---------------------------------------------------------------------------
do $$
declare
  v_constraint text;
begin
  select conname into v_constraint
  from pg_constraint
  where conrelid = 'public.rewards'::regclass
    and contype = 'c'
    and pg_get_constraintdef(oid) ilike '%status%';

  if v_constraint is not null then
    execute format('alter table public.rewards drop constraint %I', v_constraint);
  end if;
end $$;

alter table public.rewards
  add constraint rewards_status_check
  check (status in ('draft', 'scheduled', 'published', 'archived'));

-- ---------------------------------------------------------------------------
-- 2. Service fee on transactions (display-only; does not affect balances).
-- ---------------------------------------------------------------------------
alter table public.transactions
  add column if not exists service_fee numeric(12, 2) not null default 0
    check (service_fee >= 0);

-- ---------------------------------------------------------------------------
-- 3. Streak cycle tracking + redemption audit.
-- ---------------------------------------------------------------------------
alter table public.profiles
  add column if not exists streak_cycle integer not null default 0
    check (streak_cycle >= 0);

create table if not exists public.streak_redemptions (
  id uuid primary key default gen_random_uuid(),
  driver_id uuid not null references public.profiles(id) on delete cascade,
  milestone_weeks integer not null check (milestone_weeks > 0),
  streak_cycle integer not null check (streak_cycle >= 0),
  points_awarded integer not null check (points_awarded > 0),
  redeemed_at timestamptz not null default now(),
  unique (driver_id, milestone_weeks, streak_cycle)
);

create index if not exists streak_redemptions_driver_idx
  on public.streak_redemptions (driver_id);

alter table public.streak_redemptions enable row level security;

drop policy if exists "streak_redemptions_admin_all" on public.streak_redemptions;
create policy "streak_redemptions_admin_all"
  on public.streak_redemptions
  for all to authenticated
  using (
    (select role from public.profiles where user_id = auth.uid()) = 'admin'
  )
  with check (
    (select role from public.profiles where user_id = auth.uid()) = 'admin'
  );

grant select on public.streak_redemptions to service_role;
grant insert on public.streak_redemptions to service_role;

-- ---------------------------------------------------------------------------
-- 4. log_transaction gains a service fee.
--
-- Added as a NEW overload (p_service_fee has no default) so the existing
-- 10-argument version keeps working until the server action is updated. The
-- fee is stored but deliberately excluded from every balance update.
-- ---------------------------------------------------------------------------
create or replace function public.log_transaction(
  p_driver_id uuid,
  p_type text,
  p_amount numeric,
  p_litres numeric,
  p_vehicle_id uuid,
  p_garage_id uuid,
  p_created_at timestamptz,
  p_overlimit_action text,
  p_points_earned integer,
  p_on_time boolean,
  p_service_fee numeric
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_type public.transaction_type;
  v_created_at timestamptz := coalesce(p_created_at, now());
  v_service_fee numeric := coalesce(p_service_fee, 0);
begin
  if p_driver_id is null then
    return jsonb_build_object('ok', false, 'error', 'Driver is required.');
  end if;

  if p_amount is null or p_amount <= 0 then
    return jsonb_build_object(
      'ok',
      false,
      'error',
      'Amount must be greater than zero.'
    );
  end if;

  if v_service_fee < 0 then
    return jsonb_build_object(
      'ok',
      false,
      'error',
      'Service fee cannot be negative.'
    );
  end if;

  if p_overlimit_action is not null
     and p_overlimit_action not in ('authorize', 'unauthorized') then
    return jsonb_build_object(
      'ok',
      false,
      'error',
      'Invalid over-limit action.'
    );
  end if;

  v_type := p_type::public.transaction_type;

  insert into public.transactions (
    driver_id,
    vehicle_id,
    garage_id,
    type,
    amount,
    service_fee,
    litres,
    points_earned,
    created_at,
    overlimit_acknowledged,
    authorized_overlimit
  )
  values (
    p_driver_id,
    p_vehicle_id,
    p_garage_id,
    v_type,
    p_amount,
    v_service_fee,
    p_litres,
    greatest(coalesce(p_points_earned, 0), 0),
    v_created_at,
    p_overlimit_action is not null,
    coalesce(p_overlimit_action = 'authorize', false)
  );

  if coalesce(p_on_time, false)
     and v_type in ('fuel_repayment', 'repair_repayment', 'rental_repayment') then
    update public.profiles
    set current_streak = coalesce(current_streak, 0) + 1,
        updated_at = now()
    where id = p_driver_id;

    if not found then
      raise exception 'Driver not found.' using errcode = '23503';
    end if;
  end if;

  if v_type = 'fuel_issue' and p_overlimit_action = 'unauthorized' then
    insert into public.transactions (
      driver_id,
      vehicle_id,
      garage_id,
      type,
      amount,
      created_at
    )
    values (
      p_driver_id,
      p_vehicle_id,
      p_garage_id,
      'penalty_fee',
      100,
      v_created_at
    );

    update public.profiles
    set overlimit_count = coalesce(overlimit_count, 0) + 1,
        last_penalty_at = now(),
        updated_at = now()
    where id = p_driver_id;
  end if;

  return jsonb_build_object('ok', true);
end;
$$;

revoke all on function public.log_transaction(
  uuid, text, numeric, numeric, uuid, uuid, timestamptz, text, integer, boolean, numeric
) from public;
revoke all on function public.log_transaction(
  uuid, text, numeric, numeric, uuid, uuid, timestamptz, text, integer, boolean, numeric
) from anon, authenticated;
grant execute on function public.log_transaction(
  uuid, text, numeric, numeric, uuid, uuid, timestamptz, text, integer, boolean, numeric
) to service_role;

-- ---------------------------------------------------------------------------
-- 5. Atomic streak milestone redemption (100 points per milestone).
--
-- Locks the driver row, validates the streak and current cycle, then awards
-- points and records the redemption in a single transaction. Calling this
-- twice concurrently cannot double-award: the second call blocks on the row
-- lock and then fails the existing-redemption check (or the unique constraint).
-- ---------------------------------------------------------------------------
create or replace function public.redeem_streak_milestone(
  p_driver_id uuid,
  p_milestone_weeks integer,
  p_points integer default 100
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_driver public.profiles%rowtype;
  v_points integer := coalesce(p_points, 100);
begin
  if p_driver_id is null then
    return jsonb_build_object('ok', false, 'error', 'Driver is required.');
  end if;

  if p_milestone_weeks is null or p_milestone_weeks <= 0 then
    return jsonb_build_object('ok', false, 'error', 'Invalid milestone.');
  end if;

  if v_points <= 0 then
    return jsonb_build_object('ok', false, 'error', 'Invalid points amount.');
  end if;

  select * into v_driver
  from public.profiles
  where id = p_driver_id
  for update;

  if not found then
    return jsonb_build_object('ok', false, 'error', 'Driver not found.');
  end if;

  if coalesce(v_driver.current_streak, 0) < p_milestone_weeks then
    return jsonb_build_object(
      'ok',
      false,
      'error',
      'Your streak has not reached this milestone yet.'
    );
  end if;

  if exists (
    select 1
    from public.streak_redemptions
    where driver_id = p_driver_id
      and milestone_weeks = p_milestone_weeks
      and streak_cycle = v_driver.streak_cycle
  ) then
    return jsonb_build_object(
      'ok',
      false,
      'error',
      'This milestone has already been redeemed for your current streak.'
    );
  end if;

  update public.profiles
  set points_balance = coalesce(points_balance, 0) + v_points,
      lifetime_points_earned = coalesce(lifetime_points_earned, 0) + v_points,
      updated_at = now()
  where id = p_driver_id;

  insert into public.streak_redemptions (
    driver_id,
    milestone_weeks,
    streak_cycle,
    points_awarded
  )
  values (
    p_driver_id,
    p_milestone_weeks,
    v_driver.streak_cycle,
    v_points
  );

  return jsonb_build_object(
    'ok', true,
    'points_awarded', v_points,
    'streak_cycle', v_driver.streak_cycle
  );
end;
$$;

revoke all on function public.redeem_streak_milestone(uuid, integer, integer)
  from public;
revoke all on function public.redeem_streak_milestone(uuid, integer, integer)
  from anon, authenticated;
grant execute on function public.redeem_streak_milestone(uuid, integer, integer)
  to service_role;

-- ---------------------------------------------------------------------------
-- 6. Atomic free-perk claim.
--
-- Point-priced rewards are redeemed through redeem_driver_points. This RPC
-- handles free perks/giveaways (point_cost is null/0) with the same inventory
-- and per-driver checks, locking the reward row to avoid overselling.
-- ---------------------------------------------------------------------------
create or replace function public.claim_free_reward(
  p_driver_id uuid,
  p_reward_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_reward public.rewards%rowtype;
  v_driver public.profiles%rowtype;
  v_claim_id uuid;
  v_voucher_code text;
begin
  select * into v_reward
  from public.rewards
  where id = p_reward_id
  for update;

  if not found then
    return jsonb_build_object('ok', false, 'error', 'Reward not found.');
  end if;

  if v_reward.status not in ('scheduled', 'published') then
    return jsonb_build_object('ok', false, 'error', 'This reward is not available.');
  end if;

  if v_reward.publish_at > now() then
    return jsonb_build_object('ok', false, 'error', 'This reward has not been published yet.');
  end if;

  if v_reward.expires_at is not null and now() >= v_reward.expires_at then
    return jsonb_build_object('ok', false, 'error', 'This reward has expired.');
  end if;

  if v_reward.point_cost is not null and v_reward.point_cost > 0 then
    return jsonb_build_object('ok', false, 'error', 'This reward must be redeemed with points.');
  end if;

  select * into v_driver
  from public.profiles
  where id = p_driver_id;

  if not found then
    return jsonb_build_object('ok', false, 'error', 'Driver not found.');
  end if;

  if v_reward.audience = 'garage_specific'
     and v_driver.fuel_garage_id is distinct from v_reward.garage_id then
    return jsonb_build_object('ok', false, 'error', 'This reward is not available to your account.');
  end if;

  if v_reward.audience = 'tier_specific'
     and v_driver.membership_tier is distinct from v_reward.membership_tier then
    return jsonb_build_object('ok', false, 'error', 'This reward is not available to your membership tier.');
  end if;

  if v_reward.per_driver_limit > 0 then
    if (
      select count(*)
      from public.reward_claims
      where reward_id = p_reward_id
        and driver_id = p_driver_id
        and status <> 'rejected'
    ) >= v_reward.per_driver_limit then
      return jsonb_build_object('ok', false, 'error', 'You have already claimed this reward.');
    end if;
  end if;

  if v_reward.max_claims is not null then
    if (
      select count(*)
      from public.reward_claims
      where reward_id = p_reward_id
        and status <> 'rejected'
    ) >= v_reward.max_claims then
      return jsonb_build_object('ok', false, 'error', 'This reward is sold out.');
    end if;
  end if;

  v_voucher_code := 'GG-' || upper(substr(md5(gen_random_uuid()::text), 1, 8));

  insert into public.reward_claims (
    reward_id,
    driver_id,
    status,
    points_redeemed,
    voucher_code
  )
  values (
    p_reward_id,
    p_driver_id,
    'pending',
    0,
    v_voucher_code
  )
  returning id into v_claim_id;

  return jsonb_build_object(
    'ok', true,
    'claim_id', v_claim_id,
    'claim_status', 'pending',
    'voucher_code', v_voucher_code
  );
end;
$$;

revoke all on function public.claim_free_reward(uuid, uuid) from public;
revoke all on function public.claim_free_reward(uuid, uuid) from anon, authenticated;
grant execute on function public.claim_free_reward(uuid, uuid) to service_role;

-- ---------------------------------------------------------------------------
-- 7. Recreate views so they expose the new service_fee column.
-- ---------------------------------------------------------------------------
-- The dashboard materialized view depends on active_transactions, so drop
-- and recreate it after the view is rebuilt.
drop materialized view if exists public.mv_platform_historical_stats;

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

drop view if exists public.admin_transactions_search;
create view public.admin_transactions_search
with (security_invoker = true) as
select
  t.id,
  t.driver_id,
  t.vehicle_id,
  t.garage_id,
  t.type,
  t.amount,
  t.service_fee,
  t.litres,
  t.points_earned,
  t.created_at,
  v.make_model as vehicle_name,
  g.name as garage_name,
  p.full_name as driver_name,
  p.email as driver_email,
  p.phone as driver_phone
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

grant select on public.admin_transactions_search to authenticated, service_role;
