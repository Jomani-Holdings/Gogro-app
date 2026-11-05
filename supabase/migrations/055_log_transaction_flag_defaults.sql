-- Keep authorized_overlimit non-null for normal transactions.
--
-- Migration 054 inserted NULL when no override was supplied. The column
-- previously defaulted to false, so restore that behaviour while keeping the
-- rest of the atomic RPC unchanged.

create or replace function public.log_transaction(
  p_driver_id uuid,
  p_type text,
  p_amount numeric,
  p_litres numeric default null,
  p_vehicle_id uuid default null,
  p_garage_id uuid default null,
  p_created_at timestamptz default null,
  p_overlimit_action text default null,
  p_points_earned integer default 0,
  p_on_time boolean default false
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_type public.transaction_type;
  v_created_at timestamptz := coalesce(p_created_at, now());
begin
  if p_driver_id is null then
    return jsonb_build_object('ok', false, 'error', 'Driver is required.');
  end if;

  if p_amount is null or p_amount <= 0 then
    return jsonb_build_object(
      'ok',
      false,
      'error',
      'Amount must be greater than zero.'
    );
  end if;

  if p_overlimit_action is not null
     and p_overlimit_action not in ('authorize', 'unauthorized') then
    return jsonb_build_object(
      'ok',
      false,
      'error',
      'Invalid over-limit action.'
    );
  end if;

  v_type := p_type::public.transaction_type;

  insert into public.transactions (
    driver_id,
    vehicle_id,
    garage_id,
    type,
    amount,
    litres,
    points_earned,
    created_at,
    overlimit_acknowledged,
    authorized_overlimit
  )
  values (
    p_driver_id,
    p_vehicle_id,
    p_garage_id,
    v_type,
    p_amount,
    p_litres,
    greatest(coalesce(p_points_earned, 0), 0),
    v_created_at,
    p_overlimit_action is not null,
    coalesce(p_overlimit_action = 'authorize', false)
  );

  if coalesce(p_on_time, false)
     and v_type in ('fuel_repayment', 'repair_repayment', 'rental_repayment') then
    update public.profiles
    set current_streak = coalesce(current_streak, 0) + 1,
        updated_at = now()
    where id = p_driver_id;

    if not found then
      raise exception 'Driver not found.' using errcode = '23503';
    end if;
  end if;

  if v_type = 'fuel_issue' and p_overlimit_action = 'unauthorized' then
    insert into public.transactions (
      driver_id,
      vehicle_id,
      garage_id,
      type,
      amount,
      created_at
    )
    values (
      p_driver_id,
      p_vehicle_id,
      p_garage_id,
      'penalty_fee',
      100,
      v_created_at
    );

    update public.profiles
    set overlimit_count = coalesce(overlimit_count, 0) + 1,
        last_penalty_at = now(),
        updated_at = now()
    where id = p_driver_id;
  end if;

  return jsonb_build_object('ok', true);
end;
$$;

revoke all on function public.log_transaction(
  uuid, text, numeric, numeric, uuid, uuid, timestamptz, text, integer, boolean
) from public;
revoke all on function public.log_transaction(
  uuid, text, numeric, numeric, uuid, uuid, timestamptz, text, integer, boolean
) from anon, authenticated;
grant execute on function public.log_transaction(
  uuid, text, numeric, numeric, uuid, uuid, timestamptz, text, integer, boolean
) to service_role;
