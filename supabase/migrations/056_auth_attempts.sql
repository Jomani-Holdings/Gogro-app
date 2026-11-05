-- Database-backed auth attempt tracking for application-level rate limiting.
--
-- Written only through the service-role client from server actions. No RLS
-- policies are defined so anon/authenticated clients cannot read or mutate
-- attempt history.

create table if not exists public.auth_attempts (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  action text not null check (action in ('login', 'password_reset')),
  success boolean not null default false,
  ip_hash text,
  created_at timestamptz not null default now()
);

create index if not exists auth_attempts_email_action_created_at_idx
  on public.auth_attempts (email, action, created_at desc);

alter table public.auth_attempts enable row level security;

revoke all on table public.auth_attempts from public;
revoke all on table public.auth_attempts from anon, authenticated;
grant select, insert, delete on table public.auth_attempts to service_role;
