-- Hot-path indexes and fuel-code uniqueness.
--
-- These indexes back the admin dashboard, payment-proof review, notifications,
-- and driver lookups. They are intentionally additive and safe to apply while
-- the app is running.

-- Driver lookups / filters.
create index if not exists profiles_role_idx
  on public.profiles (role);
create index if not exists profiles_driver_status_idx
  on public.profiles (driver_status);
create index if not exists profiles_fuel_balance_idx
  on public.profiles (fuel_balance);
create index if not exists profiles_email_idx
  on public.profiles (email);
create index if not exists profiles_fuel_code_idx
  on public.profiles (fuel_code);

-- Fuel codes are assigned by admins and must be unique when present.
create unique index if not exists profiles_fuel_code_unique_idx
  on public.profiles (fuel_code)
  where fuel_code is not null;

-- Payment-proof review queue.
create index if not exists payment_proofs_profile_created_idx
  on public.payment_proofs (profile_id, created_at desc);
create index if not exists payment_proofs_status_created_idx
  on public.payment_proofs (status, created_at desc);

-- Ledger reporting / driver history.
create index if not exists transactions_type_created_idx
  on public.transactions (type, created_at desc);
create index if not exists transactions_driver_type_created_desc_idx
  on public.transactions (driver_id, type, created_at desc);

-- CRM and vehicle lists.
create index if not exists leads_created_at_idx
  on public.leads (created_at desc);
create index if not exists vehicles_driver_created_idx
  on public.vehicles (driver_id, created_at desc);

-- Notification bell: newest-first per user.
create index if not exists notifications_user_created_idx
  on public.notifications (user_id, created_at desc);
