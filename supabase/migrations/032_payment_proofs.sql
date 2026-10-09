-- Phase: client proof-of-payment uploads (fuel repayments).

create table if not exists public.payment_proofs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  profile_id uuid references public.profiles(id) on delete set null,
  storage_path text not null,
  filename text not null,
  category text not null default 'fuel_repayment',
  status text not null default 'pending',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists payment_proofs_user_idx on public.payment_proofs (user_id);
create index if not exists payment_proofs_status_idx on public.payment_proofs (status);

alter table public.payment_proofs enable row level security;

drop policy if exists "payment_proofs_own_read" on public.payment_proofs;
create policy "payment_proofs_own_read" on public.payment_proofs
  for select using (auth.uid() = user_id);

drop policy if exists "payment_proofs_own_insert" on public.payment_proofs;
create policy "payment_proofs_own_insert" on public.payment_proofs
  for insert with check (auth.uid() = user_id);
