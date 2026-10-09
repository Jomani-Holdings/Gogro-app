-- Security lockdown for two tables that were previously too permissive.
--
-- 1. `email_templates` had a single policy granting ALL operations to
--    everyone (`using (true)`), including anon. Admin pages and email sending
--    use the service role and bypass RLS, so we can safely restrict this table
--    to authenticated admins only.
-- 2. `password_reset_codes` was created without RLS at all. Reset codes must
--    never be readable by other users, so we enable RLS and expose only a
--    user's own rows.

-- 1. email_templates: admin-only access.
drop policy if exists "email_templates_admin_write" on public.email_templates;

drop policy if exists "email_templates_admin_all" on public.email_templates;
create policy "email_templates_admin_all"
  on public.email_templates
  for all
  using (
    (select role from public.profiles where user_id = auth.uid()) = 'admin'
  );

-- 2. password_reset_codes: enable RLS and restrict reads to the owner.
alter table public.password_reset_codes enable row level security;

drop policy if exists "password_reset_codes_own_select" on public.password_reset_codes;
create policy "password_reset_codes_own_select"
  on public.password_reset_codes
  for select
  using (auth.uid() = user_id);
