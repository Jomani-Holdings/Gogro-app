-- Soft-delete + restore for the immutable transactions ledger.
--
-- The `transactions` table stays append-only (migration 031). Deleting a
-- transaction does two things atomically:
--   1. inserts a reversing transaction that exactly negates the original's
--      balance effect, and
--   2. records the deletion in `transaction_deletions`.
--
-- Restoring inserts a re-applying transaction and marks the deletion record
-- restored. Normal reads should use `active_transactions`, which hides deleted
-- originals and every system-generated reversal/restoration row.

-- 1. Link reversal/restoration rows back to the row they adjust.
alter table public.transactions
  add column if not exists reverses_transaction_id uuid
    references public.transactions(id) on delete set null,
  add column if not exists restores_transaction_id uuid
    references public.transactions(id) on delete set null;

create index if not exists transactions_reverses_idx
  on public.transactions (reverses_transaction_id);
create index if not exists transactions_restores_idx
  on public.transactions (restores_transaction_id);

-- 2. Deletion audit table.
create table if not exists public.transaction_deletions (
  id uuid primary key default gen_random_uuid(),
  transaction_id uuid not null references public.transactions(id) on delete cascade,
  reversal_transaction_id uuid references public.transactions(id) on delete set null,
  restoration_transaction_id uuid references public.transactions(id) on delete set null,
  deleted_by uuid references public.profiles(id) on delete set null,
  deleted_at timestamptz not null default now(),
  restored_by uuid references public.profiles(id) on delete set null,
  restored_at timestamptz,
  reason text
);

create index if not exists transaction_deletions_transaction_idx
  on public.transaction_deletions (transaction_id);
create index if not exists transaction_deletions_deleted_at_idx
  on public.transaction_deletions (deleted_at desc);

-- Only one active deletion per transaction; restored rows may be deleted again.
create unique index if not exists transaction_deletions_active_unique
  on public.transaction_deletions (transaction_id)
  where restored_at is null;

alter table public.transaction_deletions enable row level security;

drop policy if exists "transaction_deletions_admin_all" on public.transaction_deletions;
create policy "transaction_deletions_admin_all"
  on public.transaction_deletions
  for all
  using (
    (select role from public.profiles where user_id = auth.uid()) = 'admin'
  )
  with check (
    (select role from public.profiles where user_id = auth.uid()) = 'admin'
  );

-- 3. Active ledger view. Hides deleted originals and all system rows.
create or replace view public.active_transactions
with (security_invoker = true) as
select
  t.*,
  v.make_model as vehicle_name,
  g.name as garage_name,
  p.full_name as driver_name
from public.transactions t
left join public.vehicles v on v.id = t.vehicle_id
left join public.garages g on g.id = t.garage_id
left join public.profiles p on p.id = t.driver_id
where t.reverses_transaction_id is null
  and t.restores_transaction_id is null
  and not exists (
    select 1
    from public.transaction_deletions d
    where d.transaction_id = t.id
      and d.restored_at is null
  );

-- Explicit grants so the dashboard (service role) and admin sessions can read
-- the view; the view itself runs with the caller's RLS via security_invoker.
grant select on public.active_transactions to authenticated, service_role;
grant select, insert, update on public.transaction_deletions to service_role;
grant select on public.transaction_deletions to authenticated;

-- 4. Balance helpers.
create or replace function public.apply_transaction_effect(
  p_driver_id uuid,
  p_type text,
  p_amount numeric
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_type = 'fuel_issue' then
    update public.profiles
    set driver_balance = coalesce(driver_balance, 0) + p_amount,
        fuel_balance = coalesce(fuel_balance, 0) + p_amount,
        updated_at = now()
    where id = p_driver_id;
  elsif p_type = 'repair_issue' then
    update public.profiles
    set driver_balance = coalesce(driver_balance, 0) + p_amount,
        repair_balance = coalesce(repair_balance, 0) + p_amount,
        updated_at = now()
    where id = p_driver_id;
  elsif p_type = 'rental_fee' then
    update public.profiles
    set driver_balance = coalesce(driver_balance, 0) + p_amount,
        rental_balance = coalesce(rental_balance, 0) + p_amount,
        updated_at = now()
    where id = p_driver_id;
  elsif p_type = 'penalty_fee' then
    update public.profiles
    set driver_balance = coalesce(driver_balance, 0) + p_amount,
        penalty_balance = coalesce(penalty_balance, 0) + p_amount,
        updated_at = now()
    where id = p_driver_id;
  elsif p_type = 'balance_correction_increase' then
    update public.profiles
    set driver_balance = coalesce(driver_balance, 0) + p_amount,
        penalty_balance = coalesce(penalty_balance, 0) + p_amount,
        updated_at = now()
    where id = p_driver_id;
  elsif p_type = 'fuel_repayment' then
    update public.profiles
    set driver_balance = greatest(coalesce(driver_balance, 0) - p_amount, 0),
        fuel_balance = greatest(coalesce(fuel_balance, 0) - p_amount, 0),
        updated_at = now()
    where id = p_driver_id;
  elsif p_type = 'repair_repayment' then
    update public.profiles
    set driver_balance = greatest(coalesce(driver_balance, 0) - p_amount, 0),
        repair_balance = greatest(coalesce(repair_balance, 0) - p_amount, 0),
        updated_at = now()
    where id = p_driver_id;
  elsif p_type = 'rental_repayment' then
    update public.profiles
    set driver_balance = greatest(coalesce(driver_balance, 0) - p_amount, 0),
        rental_balance = greatest(coalesce(rental_balance, 0) - p_amount, 0),
        updated_at = now()
    where id = p_driver_id;
  elsif p_type = 'balance_correction_decrease' then
    update public.profiles
    set driver_balance = greatest(coalesce(driver_balance, 0) - p_amount, 0),
        penalty_balance = greatest(coalesce(penalty_balance, 0) - p_amount, 0),
        updated_at = now()
    where id = p_driver_id;
  elsif p_type = 'reward_credit' then
    -- Intentionally allows negative balances: a credit the driver can spend.
    update public.profiles
    set driver_balance = coalesce(driver_balance, 0) - p_amount,
        fuel_balance = coalesce(fuel_balance, 0) - p_amount,
        updated_at = now()
    where id = p_driver_id;
  end if;
end;
$$;

create or replace function public.negate_transaction_effect(
  p_driver_id uuid,
  p_type text,
  p_amount numeric
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Exact algebraic opposite of apply_transaction_effect. No clamping: a
  -- deletion may create a credit balance, and the UI warns the admin first.
  if p_type = 'fuel_issue' then
    update public.profiles
    set driver_balance = coalesce(driver_balance, 0) - p_amount,
        fuel_balance = coalesce(fuel_balance, 0) - p_amount,
        updated_at = now()
    where id = p_driver_id;
  elsif p_type = 'repair_issue' then
    update public.profiles
    set driver_balance = coalesce(driver_balance, 0) - p_amount,
        repair_balance = coalesce(repair_balance, 0) - p_amount,
        updated_at = now()
    where id = p_driver_id;
  elsif p_type = 'rental_fee' then
    update public.profiles
    set driver_balance = coalesce(driver_balance, 0) - p_amount,
        rental_balance = coalesce(rental_balance, 0) - p_amount,
        updated_at = now()
    where id = p_driver_id;
  elsif p_type = 'penalty_fee' then
    update public.profiles
    set driver_balance = coalesce(driver_balance, 0) - p_amount,
        penalty_balance = coalesce(penalty_balance, 0) - p_amount,
        updated_at = now()
    where id = p_driver_id;
  elsif p_type = 'balance_correction_increase' then
    update public.profiles
    set driver_balance = coalesce(driver_balance, 0) - p_amount,
        penalty_balance = coalesce(penalty_balance, 0) - p_amount,
        updated_at = now()
    where id = p_driver_id;
  elsif p_type = 'fuel_repayment' then
    update public.profiles
    set driver_balance = coalesce(driver_balance, 0) + p_amount,
        fuel_balance = coalesce(fuel_balance, 0) + p_amount,
        updated_at = now()
    where id = p_driver_id;
  elsif p_type = 'repair_repayment' then
    update public.profiles
    set driver_balance = coalesce(driver_balance, 0) + p_amount,
        repair_balance = coalesce(repair_balance, 0) + p_amount,
        updated_at = now()
    where id = p_driver_id;
  elsif p_type = 'rental_repayment' then
    update public.profiles
    set driver_balance = coalesce(driver_balance, 0) + p_amount,
        rental_balance = coalesce(rental_balance, 0) + p_amount,
        updated_at = now()
    where id = p_driver_id;
  elsif p_type = 'balance_correction_decrease' then
    update public.profiles
    set driver_balance = coalesce(driver_balance, 0) + p_amount,
        penalty_balance = coalesce(penalty_balance, 0) + p_amount,
        updated_at = now()
    where id = p_driver_id;
  elsif p_type = 'reward_credit' then
    update public.profiles
    set driver_balance = coalesce(driver_balance, 0) + p_amount,
        fuel_balance = coalesce(fuel_balance, 0) + p_amount,
        updated_at = now()
    where id = p_driver_id;
  end if;
end;
$$;

-- 5. Trigger delegates to the helpers and understands system rows.
create or replace function public.update_profile_balance_on_transaction()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_ref_type text;
begin
  if new.restores_transaction_id is not null then
    select type::text into v_ref_type
    from public.transactions
    where id = new.restores_transaction_id;

    if v_ref_type is not null then
      perform public.apply_transaction_effect(new.driver_id, v_ref_type, new.amount);
    end if;
    return new;
  end if;

  if new.reverses_transaction_id is not null then
    select type::text into v_ref_type
    from public.transactions
    where id = new.reverses_transaction_id;

    if v_ref_type is not null then
      perform public.negate_transaction_effect(new.driver_id, v_ref_type, new.amount);
    end if;
    return new;
  end if;

  perform public.apply_transaction_effect(new.driver_id, new.type::text, new.amount);
  return new;
end;
$$;

drop trigger if exists transactions_update_profile_balance on public.transactions;
create trigger transactions_update_profile_balance
after insert on public.transactions
for each row
execute function public.update_profile_balance_on_transaction();

-- 6. Weekly fuel helpers must ignore deleted fuel issues.
create or replace function public.driver_weekly_fuel_issued(
  p_driver_id uuid,
  as_of timestamptz default now()
)
returns numeric
language sql
stable
as $$
  select coalesce(sum(t.amount), 0)
  from public.active_transactions t
  cross join lateral public.fuel_cycle_bounds(as_of) c
  where t.driver_id = p_driver_id
    and t.type = 'fuel_issue'
    and t.created_at >= c.cycle_start
    and t.created_at < c.cycle_end;
$$;

create or replace function public.driver_weekly_fuel_issued_litres(
  p_driver_id uuid,
  as_of timestamptz default now()
)
returns numeric
language sql
stable
as $$
  select coalesce(sum(t.litres), 0)
  from public.active_transactions t
  cross join lateral public.fuel_cycle_bounds(as_of) c
  where t.driver_id = p_driver_id
    and t.type = 'fuel_issue'
    and t.created_at >= c.cycle_start
    and t.created_at < c.cycle_end;
$$;

-- 7. Atomic delete/restore RPCs.
create or replace function public.delete_transaction(
  p_transaction_id uuid,
  p_deleted_by uuid
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_original public.transactions%rowtype;
  v_reversal_type text;
  v_reversal_id uuid;
  v_deletion_id uuid;
begin
  select * into v_original
  from public.transactions
  where id = p_transaction_id;

  if not found then
    raise exception 'Transaction not found.';
  end if;

  if v_original.reverses_transaction_id is not null
     or v_original.restores_transaction_id is not null then
    raise exception 'System-generated ledger rows cannot be deleted.';
  end if;

  if exists (
    select 1 from public.transaction_deletions
    where transaction_id = p_transaction_id
      and restored_at is null
  ) then
    raise exception 'Transaction is already deleted.';
  end if;

  v_reversal_type := case v_original.type::text
    when 'fuel_issue' then 'balance_correction_decrease'
    when 'repair_issue' then 'balance_correction_decrease'
    when 'rental_fee' then 'balance_correction_decrease'
    when 'penalty_fee' then 'balance_correction_decrease'
    when 'balance_correction_increase' then 'balance_correction_decrease'
    when 'fuel_repayment' then 'balance_correction_increase'
    when 'repair_repayment' then 'balance_correction_increase'
    when 'rental_repayment' then 'balance_correction_increase'
    when 'balance_correction_decrease' then 'balance_correction_increase'
    when 'reward_credit' then 'balance_correction_increase'
    else null
  end;

  if v_reversal_type is not null then
    insert into public.transactions (
      driver_id, vehicle_id, garage_id, type, amount, litres, created_at,
      reverses_transaction_id
    )
    values (
      v_original.driver_id,
      v_original.vehicle_id,
      v_original.garage_id,
      v_reversal_type::public.transaction_type,
      v_original.amount,
      v_original.litres,
      now(),
      v_original.id
    )
    returning id into v_reversal_id;
  end if;

  insert into public.transaction_deletions (
    transaction_id, reversal_transaction_id, deleted_by
  )
  values (
    v_original.id, v_reversal_id, p_deleted_by
  )
  returning id into v_deletion_id;

  return v_deletion_id;
end;
$$;

create or replace function public.restore_transaction(
  p_transaction_id uuid,
  p_restored_by uuid
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_deletion public.transaction_deletions%rowtype;
  v_original public.transactions%rowtype;
  v_restoration_type text;
  v_restoration_id uuid;
begin
  select * into v_deletion
  from public.transaction_deletions
  where transaction_id = p_transaction_id
    and restored_at is null
  order by deleted_at desc
  limit 1;

  if not found then
    raise exception 'Transaction is not deleted.';
  end if;

  select * into v_original
  from public.transactions
  where id = p_transaction_id;

  if not found then
    raise exception 'Transaction not found.';
  end if;

  v_restoration_type := case v_original.type::text
    when 'fuel_issue' then 'balance_correction_increase'
    when 'repair_issue' then 'balance_correction_increase'
    when 'rental_fee' then 'balance_correction_increase'
    when 'penalty_fee' then 'balance_correction_increase'
    when 'balance_correction_increase' then 'balance_correction_increase'
    when 'fuel_repayment' then 'balance_correction_decrease'
    when 'repair_repayment' then 'balance_correction_decrease'
    when 'rental_repayment' then 'balance_correction_decrease'
    when 'balance_correction_decrease' then 'balance_correction_decrease'
    when 'reward_credit' then 'balance_correction_decrease'
    else null
  end;

  if v_restoration_type is not null then
    insert into public.transactions (
      driver_id, vehicle_id, garage_id, type, amount, litres, created_at,
      restores_transaction_id
    )
    values (
      v_original.driver_id,
      v_original.vehicle_id,
      v_original.garage_id,
      v_restoration_type::public.transaction_type,
      v_original.amount,
      v_original.litres,
      now(),
      v_original.id
    )
    returning id into v_restoration_id;
  end if;

  update public.transaction_deletions
  set restored_at = now(),
      restored_by = p_restored_by,
      restoration_transaction_id = v_restoration_id
  where id = v_deletion.id;

  return v_deletion.id;
end;
$$;

-- 8. Keep the RPCs and balance helpers out of reach of ordinary users.
revoke all on function public.apply_transaction_effect(uuid, text, numeric) from public;
revoke all on function public.negate_transaction_effect(uuid, text, numeric) from public;
revoke all on function public.delete_transaction(uuid, uuid) from public;
revoke all on function public.restore_transaction(uuid, uuid) from public;

grant execute on function public.apply_transaction_effect(uuid, text, numeric) to service_role;
grant execute on function public.negate_transaction_effect(uuid, text, numeric) to service_role;
grant execute on function public.delete_transaction(uuid, uuid) to service_role;
grant execute on function public.restore_transaction(uuid, uuid) to service_role;
