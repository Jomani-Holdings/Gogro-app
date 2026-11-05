-- P1 performance indexes.
--
-- Search indexes use pg_trgm + gin_trgm_ops so ILIKE '%term%' can use an
-- index. Cursor indexes are composite (created_at, id) to support keyset
-- pagination without OFFSET scans.

create extension if not exists pg_trgm;

-- Admin driver search.
create index if not exists profiles_full_name_trgm_idx
  on public.profiles using gin (full_name gin_trgm_ops);
create index if not exists profiles_email_trgm_idx
  on public.profiles using gin (email gin_trgm_ops);
create index if not exists profiles_phone_trgm_idx
  on public.profiles using gin (phone gin_trgm_ops);

-- Admin driver filters.
create index if not exists profiles_role_status_fuel_balance_idx
  on public.profiles (role, driver_status, fuel_balance);
create index if not exists profiles_fuel_garage_idx
  on public.profiles (fuel_garage_id);
create index if not exists profiles_suspended_idx
  on public.profiles (suspended);

-- Cursor pagination: (created_at, id) desc.
create index if not exists profiles_created_id_desc_idx
  on public.profiles (created_at desc, id desc);
create index if not exists transactions_created_id_desc_idx
  on public.transactions (created_at desc, id desc);
create index if not exists payment_proofs_created_id_desc_idx
  on public.payment_proofs (created_at desc, id desc);
create index if not exists leads_created_id_desc_idx
  on public.leads (created_at desc, id desc);
create index if not exists vehicles_created_id_desc_idx
  on public.vehicles (created_at desc, id desc);
create index if not exists form_submissions_created_id_desc_idx
  on public.form_submissions (created_at desc, id desc);
create index if not exists transaction_deletions_deleted_id_desc_idx
  on public.transaction_deletions (deleted_at desc, id desc);

-- Filtered cursor indexes.
create index if not exists transactions_driver_created_id_desc_idx
  on public.transactions (driver_id, created_at desc, id desc);
create index if not exists payment_proofs_status_category_created_id_desc_idx
  on public.payment_proofs (status, category, created_at desc, id desc);
create index if not exists vehicles_status_created_id_desc_idx
  on public.vehicles (status, created_at desc, id desc);
create index if not exists vehicles_ownership_created_id_desc_idx
  on public.vehicles (ownership_type, created_at desc, id desc);
create index if not exists leads_status_created_id_desc_idx
  on public.leads (status, created_at desc, id desc);
create index if not exists form_submissions_status_created_id_desc_idx
  on public.form_submissions (status, created_at desc, id desc);

-- Admin lead search.
create index if not exists leads_full_name_trgm_idx
  on public.leads using gin (full_name gin_trgm_ops);
create index if not exists leads_email_trgm_idx
  on public.leads using gin (email gin_trgm_ops);
create index if not exists leads_phone_trgm_idx
  on public.leads using gin (phone gin_trgm_ops);

-- Repair ledger scans by driver.
create index if not exists transactions_driver_type_created_id_desc_idx
  on public.transactions (driver_id, type, created_at desc, id desc);
