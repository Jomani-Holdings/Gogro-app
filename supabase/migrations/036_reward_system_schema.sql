-- Driver Rewards & Benefits Programme — foundation schema.
--
-- Supports all three phases:
--   Phase 1: admin reward campaigns, teaser/publish scheduling, public page.
--   Phase 2: driver claims + live timed vouchers.
--   Phase 3: automatic programme rewards (referrals, on-time streaks).
--
-- NOTE: teaser copy is stored alongside the real copy, but the real copy is
-- only ever exposed by the server data layer after `publish_at`. See
-- lib/data/rewards.ts (maskClientReward).

-- 1. Membership tier on profiles. All existing drivers start on standard;
--    gold/platinum are earned or assigned manually by an admin.
alter table public.profiles
  add column if not exists membership_tier text not null default 'standard'
    check (membership_tier in ('standard', 'gold', 'platinum'));

-- 2. Standardize vehicle category (UI-only marketing copy; no numeric cap is
--    enforced in the database — admins approve repair amounts manually).
do $$
begin
  if not exists (select 1 from pg_type where typname = 'vehicle_category') then
    create type public.vehicle_category as enum (
      'uber_go',
      'uber_black',
      'delivery',
      'other'
    );
  end if;
end $$;

-- A) Map specific known variants FIRST so the catch-all cannot wipe them.
update public.vehicles
  set category = 'uber_go'
  where lower(btrim(category)) in ('uber go', 'ubergo', 'go');

update public.vehicles
  set category = 'uber_black'
  where lower(btrim(category)) in ('uber black', 'uberblack', 'black', 'premium');

update public.vehicles
  set category = 'delivery'
  where lower(btrim(category)) in ('delivery', 'bakkie', 'van');

-- A2) Normalize case/whitespace on already-standard labels (e.g. 'UBER_GO').
update public.vehicles
  set category = lower(btrim(category))
  where lower(btrim(category)) in ('uber_go', 'uber_black', 'delivery', 'other');

-- B) Catch-all for anything else (including NULL) AFTER known variants saved.
update public.vehicles
  set category = 'other'
  where category is null
     or lower(btrim(category)) not in ('uber_go', 'uber_black', 'delivery', 'other');

-- C) Safe to cast.
do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'vehicles'
      and column_name = 'category'
      and udt_name <> 'vehicle_category'
  ) then
    alter table public.vehicles
      alter column category type public.vehicle_category
        using category::public.vehicle_category;
  end if;
end $$;

-- 3. Dedicated reward credit ledger type. Kept separate from balance
--    corrections so reward spend is reportable on its own.
alter type public.transaction_type add value if not exists 'reward_credit';

-- 4. Storage bucket for reward artwork (served through /api/media).
insert into storage.buckets (id, name, public)
values ('rewards', 'rewards', false)
on conflict (id) do nothing;

-- 5. Reward campaigns.
create table if not exists public.rewards (
  id uuid primary key default gen_random_uuid(),
  status text not null default 'draft'
    check (status in ('draft', 'scheduled', 'archived')),
  reward_category text not null default 'perk'
    check (reward_category in (
      'perk',
      'programme_fuel',
      'programme_referral',
      'programme_repair'
    )),

  -- Real copy. Hidden from non-admins while the reward is a teaser.
  title text,
  description text,
  image_path text,

  -- Teaser copy. Always safe to expose.
  teaser_title text not null,
  teaser_description text,
  teaser_image_path text,

  -- Targeting.
  audience text not null default 'all_drivers'
    check (audience in ('all_drivers', 'garage_specific', 'tier_specific')),
  garage_id uuid references public.garages(id) on delete set null,
  membership_tier text
    check (membership_tier in ('standard', 'gold', 'platinum')),

  -- Economics & inventory.
  value_amount numeric(12, 2),
  max_claims int check (max_claims is null or max_claims >= 0),
  per_driver_limit int not null default 1 check (per_driver_limit >= 0),

  -- Scheduling. The live state is derived from these timestamps:
  --   now < teaser_at                    -> scheduled (hidden)
  --   teaser_at <= now < publish_at      -> teaser
  --   publish_at <= now < expires_at     -> published
  --   now >= expires_at                  -> expired
  teaser_at timestamptz,
  publish_at timestamptz not null,
  expires_at timestamptz,

  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists rewards_status_publish_idx
  on public.rewards (status, publish_at, teaser_at);
create index if not exists rewards_garage_idx on public.rewards (garage_id);
create index if not exists rewards_sort_idx on public.rewards (sort_order, created_at);

-- 6. Reward claims. `per_driver_limit` is enforced in the claim action, not
--    by a table-level unique constraint (limits may be greater than one).
create table if not exists public.reward_claims (
  id uuid primary key default gen_random_uuid(),
  reward_id uuid not null references public.rewards(id) on delete cascade,
  driver_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending'
    check (status in ('pending', 'redeemed', 'rejected')),
  voucher_code text,
  redeemed_at timestamptz,
  redeemed_by uuid references auth.users(id) on delete set null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists reward_claims_reward_idx
  on public.reward_claims (reward_id, driver_id);
create index if not exists reward_claims_driver_idx
  on public.reward_claims (driver_id);
create index if not exists reward_claims_status_idx
  on public.reward_claims (status);

-- 7. Driver referrals (Phase 3 ready).
create table if not exists public.driver_referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_id uuid not null references public.profiles(id) on delete cascade,
  referred_id uuid references public.profiles(id) on delete set null,
  referred_email text,
  status text not null default 'pending'
    check (status in ('pending', 'registered', 'probation', 'qualified', 'rewarded')),
  registered_at timestamptz,
  probation_ends_at timestamptz,
  qualified_at timestamptz,
  reward_processed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists driver_referrals_referrer_idx
  on public.driver_referrals (referrer_id);
create index if not exists driver_referrals_referred_idx
  on public.driver_referrals (referred_id);

-- 8. The balance trigger update for reward_credit lives in migration 037 so
--    that the new enum value is committed before the function references it.

-- 9. Expose membership tier through the dashboard view.
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
  (p.driver_balance > 0 and now() > public.driver_next_payment_due(p)) as is_overdue
from public.profiles p
left join public.garages g on g.id = p.fuel_garage_id;

-- 10. RLS. Admin writes use the service role (bypasses RLS). Public and
--     driver reads also go through the service role, so no anon policies.
alter table public.rewards enable row level security;
alter table public.reward_claims enable row level security;
alter table public.driver_referrals enable row level security;

drop policy if exists "rewards_admin_all" on public.rewards;
create policy "rewards_admin_all" on public.rewards
  for all to authenticated
  using (
    (select role from public.profiles where user_id = auth.uid()) = 'admin'
  )
  with check (
    (select role from public.profiles where user_id = auth.uid()) = 'admin'
  );

drop policy if exists "reward_claims_admin_all" on public.reward_claims;
create policy "reward_claims_admin_all" on public.reward_claims
  for all to authenticated
  using (
    (select role from public.profiles where user_id = auth.uid()) = 'admin'
  )
  with check (
    (select role from public.profiles where user_id = auth.uid()) = 'admin'
  );

drop policy if exists "driver_referrals_admin_all" on public.driver_referrals;
create policy "driver_referrals_admin_all" on public.driver_referrals
  for all to authenticated
  using (
    (select role from public.profiles where user_id = auth.uid()) = 'admin'
  )
  with check (
    (select role from public.profiles where user_id = auth.uid()) = 'admin'
  );
