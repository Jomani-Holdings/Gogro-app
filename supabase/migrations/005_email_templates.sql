-- Phase 2: email templates CMS.

create table public.email_templates (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  subject text not null default '',
  from_address text,
  reply_to text,
  variables jsonb not null default '[]'::jsonb,
  body jsonb,
  updated_at timestamptz not null default now()
);

alter table public.email_templates enable row level security;
create policy "email_templates_admin_write" on public.email_templates for all using (true);
