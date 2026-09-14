-- Phase 5: Driver operational data + document management.

-- 1. Extend profiles with driver operational fields.
alter table public.profiles
  add column if not exists driver_status text not null default 'pending'
    check (driver_status in ('pending', 'active', 'suspended', 'inactive')),
  add column if not exists car_make_model text,
  add column if not exists car_registration text,
  add column if not exists credit_limit numeric(12,2),
  add column if not exists fuel_balance numeric(12,2),
  add column if not exists fuel_code text,
  add column if not exists fuel_garage_id uuid references public.garages(id) on delete set null;

-- 2. Contract document on form templates (blank PDF reused per form).
alter table public.form_templates
  add column if not exists contract_document_path text;

-- 3. Add documents_requested to the lead status pipeline so applicants who
--    are waiting on documents can be filtered.
alter type public.lead_status add value if not exists 'documents_requested';

-- 4. Documents table for supporting docs + signed contracts.
create table public.documents (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references public.leads(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  category text not null,
  filename text not null,
  storage_path text not null,
  status text not null default 'pending',
  uploaded_by uuid references public.profiles(id) on delete set null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index documents_lead_idx on public.documents (lead_id);
create index documents_user_idx on public.documents (user_id);
create index documents_category_idx on public.documents (category);

-- 5. RLS. Admin writes use the service role and bypass RLS. Clients can read
--    their own documents through the browser client.
alter table public.documents enable row level security;

create policy "documents_own_read" on public.documents
  for select using (auth.uid() = user_id);

create policy "documents_own_insert" on public.documents
  for insert with check (auth.uid() = user_id);