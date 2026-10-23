-- Redeem points for a catalog reward.
--
-- Atomic: verifies balance/inventory, deducts points, records the claim, and
-- only touches the Rand ledger when the reward is Fuel Credit.

create or replace function public.redeem_driver_points(
  p_driver_id uuid,
  p_reward_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_reward public.rewards%rowtype;
  v_driver public.profiles%rowtype;
  v_claim_id uuid;
  v_claim_status text;
  v_voucher_code text;
  v_rand_value numeric(12, 2);
begin
  select * into v_reward from public.rewards where id = p_reward_id;
  if not found then
    return jsonb_build_object('ok', false, 'error', 'Reward not found.');
  end if;

  if v_reward.status = 'archived' then
    return jsonb_build_object('ok', false, 'error', 'This reward is no longer available.');
  end if;

  if v_reward.expires_at is not null and now() >= v_reward.expires_at then
    return jsonb_build_object('ok', false, 'error', 'This reward has expired.');
  end if;

  if v_reward.point_cost is null or v_reward.point_cost <= 0 then
    return jsonb_build_object('ok', false, 'error', 'This reward cannot be bought with points.');
  end if;

  select * into v_driver from public.profiles where id = p_driver_id for update;
  if not found then
    return jsonb_build_object('ok', false, 'error', 'Driver not found.');
  end if;

  if coalesce(v_driver.points_balance, 0) < v_reward.point_cost then
    return jsonb_build_object(
      'ok',
      false,
      'error',
      'Not enough points for this reward.'
    );
  end if;

  if v_reward.per_driver_limit > 0 then
    if (
      select count(*)
      from public.reward_claims
      where reward_id = p_reward_id
        and driver_id = p_driver_id
        and status <> 'rejected'
    ) >= v_reward.per_driver_limit then
      return jsonb_build_object(
        'ok',
        false,
        'error',
        'You have already claimed this reward.'
      );
    end if;
  end if;

  if v_reward.max_claims is not null then
    if (
      select count(*)
      from public.reward_claims
      where reward_id = p_reward_id
        and status <> 'rejected'
    ) >= v_reward.max_claims then
      return jsonb_build_object('ok', false, 'error', 'This reward is sold out.');
    end if;
  end if;

  update public.profiles
  set points_balance = points_balance - v_reward.point_cost,
      lifetime_points_redeemed = lifetime_points_redeemed + v_reward.point_cost,
      updated_at = now()
  where id = p_driver_id;

  if v_reward.point_reward_type = 'fuel_credit' then
    v_claim_status := 'redeemed';
    v_voucher_code := null;
  else
    v_claim_status := 'pending';
    v_voucher_code := 'GG-' || upper(substr(md5(gen_random_uuid()::text), 1, 8));
  end if;

  insert into public.reward_claims (
    reward_id,
    driver_id,
    status,
    points_redeemed,
    voucher_code,
    redeemed_at
  )
  values (
    p_reward_id,
    p_driver_id,
    v_claim_status,
    v_reward.point_cost,
    v_voucher_code,
    case when v_claim_status = 'redeemed' then now() else null end
  )
  returning id into v_claim_id;

  -- Fuel Credit is applied to the Rand ledger immediately (10 pts = R1).
  -- Other reward types stay pending for admin payout/voucher issuing.
  if v_reward.point_reward_type = 'fuel_credit' then
    v_rand_value := round(v_reward.point_cost / 10.0, 2);
    insert into public.transactions (driver_id, type, amount, created_at)
    values (p_driver_id, 'reward_credit', v_rand_value, now());
  end if;

  return jsonb_build_object(
    'ok', true,
    'claim_id', v_claim_id,
    'claim_status', v_claim_status,
    'voucher_code', v_voucher_code
  );
end;
$$;
