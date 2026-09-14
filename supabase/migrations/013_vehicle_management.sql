-- Phase 6: Vehicle management register.
--
-- A dedicated fleet register for vehicles Go Gro actively manages or rents
-- out. Separate from the basic car details on a driver's profile.

-- 1. Vehicle status enum.
create type public.vehicle_status as enum ('active', 'maintenance', 'off_road');

-- 2. Vehicles table.
create table public.vehicles (
  id uuid primary key default gen_random_uuid(),
  make_model text not null,
  registration text not null,
  driver_id uuid references public.profiles(id) on delete set null,
  owner_name text,
  category text,
  weekly_rental numeric(10, 2),
  status public.vehicle_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. No duplicate license plates (case-insensitive).
create unique index vehicles_registration_lower_idx
  on public.vehicles (lower(registration));

create index vehicles_driver_idx on public.vehicles (driver_id);
create index vehicles_status_idx on public.vehicles (status);

-- 4. RLS: admin-only full access. Admin dashboard uses the service role key,
--    which bypasses RLS, but we still scope direct access to admins.
alter table public.vehicles enable row level security;

create policy "vehicles_admin_select" on public.vehicles
  for select to authenticated
  using (
    (select role from public.profiles where user_id = auth.uid()) = 'admin'
  );

create policy "vehicles_admin_insert" on public.vehicles
  for insert to authenticated
  with check (
    (select role from public.profiles where user_id = auth.uid()) = 'admin'
  );

create policy "vehicles_admin_update" on public.vehicles
  for update to authenticated
  using (
    (select role from public.profiles where user_id = auth.uid()) = 'admin'
  )
  with check (
    (select role from public.profiles where user_id = auth.uid()) = 'admin'
  );

create policy "vehicles_admin_delete" on public.vehicles
  for delete to authenticated
  using (
    (select role from public.profiles where user_id = auth.uid()) = 'admin'
  );