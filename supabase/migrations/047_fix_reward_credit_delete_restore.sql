-- Make soft-delete/restore concurrency-safe and keep reward credits in the
-- fuel category.
--
-- The balance trigger already looks up the ORIGINAL transaction type for
-- reversal/restoration rows. This migration makes that intent explicit for
-- reward_credit and locks the rows involved so two concurrent restores cannot
-- apply the same restoration twice.

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
  where id = p_transaction_id
  for update;

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
    when 'reward_credit' then 'reward_credit'
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
  -- Lock the active deletion row so concurrent restore calls cannot both
  -- insert a restoration transaction.
  select * into v_deletion
  from public.transaction_deletions
  where transaction_id = p_transaction_id
    and restored_at is null
  order by deleted_at desc
  limit 1
  for update;

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
    when 'reward_credit' then 'reward_credit'
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

-- Keep the server-only RPCs locked down.
revoke all on function public.delete_transaction(uuid, uuid) from public;
revoke all on function public.delete_transaction(uuid, uuid) from anon, authenticated;
revoke all on function public.restore_transaction(uuid, uuid) from public;
revoke all on function public.restore_transaction(uuid, uuid) from anon, authenticated;
grant execute on function public.delete_transaction(uuid, uuid) to service_role;
grant execute on function public.restore_transaction(uuid, uuid) to service_role;
