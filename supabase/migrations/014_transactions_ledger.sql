-- Phase 7: Transaction ledger.
--
-- Powers time-based and historical KPIs on the admin dashboard. A trigger
-- keeps profiles.fuel_balance / repair_balance in sync with every ledger row.

-- 1. Transaction type enum.
create type public.transaction_type as enum (
  'fuel_issue',
  'repair_issue',
  'fuel_repayment',
  'repair_repayment',
  'rental_fee'
);

-- 2. Transactions table.
create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  driver_id uuid not null references public.profiles(id) on delete cascade,
  vehicle_id uuid references public.vehicles(id) on delete set null,
  garage_id uuid references public.garages(id) on delete set null,
  type public.transaction_type not null,
  amount numeric(12, 2) not null check (amount >= 0),
  litres numeric(10, 2) check (litres is null or litres >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index transactions_driver_idx on public.transactions (driver_id);
create index transactions_vehicle_idx on public.transactions (vehicle_id);
create index transactions_garage_idx on public.transactions (garage_id);
create index transactions_type_idx on public.transactions (type);
create index transactions_created_idx on public.transactions (created_at);

-- 3. Repair balance on profiles (alongside existing fuel_balance).
alter table public.profiles
  add column if not exists repair_balance numeric(12, 2) not null default 0;

-- 4. Trigger keeps driver balances derived from the ledger.
create or replace function public.update_profile_balance_on_transaction()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.type = 'fuel_issue' then
    update public.profiles
    set fuel_balance = fuel_balance + new.amount,
        updated_at = now()
    where id = new.driver_id;
  elsif new.type = 'repair_issue' then
    update public.profiles
    set repair_balance = repair_balance + new.amount,
        updated_at = now()
    where id = new.driver_id;
  elsif new.type = 'fuel_repayment' then
    update public.profiles
    set fuel_balance = greatest(fuel_balance - new.amount, 0),
        updated_at = now()
    where id = new.driver_id;
  elsif new.type = 'repair_repayment' then
    update public.profiles
    set repair_balance = greatest(repair_balance - new.amount, 0),
        updated_at = now()
    where id = new.driver_id;
  end if;
  return new;
end;
$$;

drop trigger if exists transactions_update_profile_balance on public.transactions;
create trigger transactions_update_profile_balance
after insert on public.transactions
for each row
execute function public.update_profile_balance_on_transaction();

-- 5. RLS: admin-only access. The dashboard uses the service role key (bypasses
--    RLS), but we scope direct access to admins.
alter table public.transactions enable row level security;

create policy "transactions_admin_select" on public.transactions
  for select to authenticated
  using (
    (select role from public.profiles where user_id = auth.uid()) = 'admin'
  );

create policy "transactions_admin_insert" on public.transactions
  for insert to authenticated
  with check (
    (select role from public.profiles where user_id = auth.uid()) = 'admin'
  );

create policy "transactions_admin_update" on public.transactions
  for update to authenticated
  using (
    (select role from public.profiles where user_id = auth.uid()) = 'admin'
  )
  with check (
    (select role from public.profiles where user_id = auth.uid()) = 'admin'
  );

create policy "transactions_admin_delete" on public.transactions
  for delete to authenticated
  using (
    (select role from public.profiles where user_id = auth.uid()) = 'admin'
  );