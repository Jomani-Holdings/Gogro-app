-- Atomic payment-proof review.
--
-- Approving a proof must insert the fuel_repayment ledger row and mark the
-- proof approved in the same transaction. The proof row is locked so two
-- admins reviewing the same screenshot cannot both credit the driver.

create or replace function public.review_payment_proof(
  p_proof_id uuid,
  p_admin_profile_id uuid,
  p_action text,
  p_amount numeric default null,
  p_notes text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_proof public.payment_proofs%rowtype;
begin
  if p_action not in ('approved', 'rejected', 'disputed') then
    return jsonb_build_object('ok', false, 'error', 'Invalid review action.');
  end if;

  select * into v_proof
  from public.payment_proofs
  where id = p_proof_id
  for update;

  if not found then
    return jsonb_build_object('ok', false, 'error', 'Payment proof not found.');
  end if;

  if p_action = 'approved' then
    if v_proof.status = 'approved' then
      return jsonb_build_object(
        'ok',
        false,
        'error',
        'This proof has already been approved.'
      );
    end if;

    if p_amount is null or p_amount <= 0 then
      return jsonb_build_object(
        'ok',
        false,
        'error',
        'Enter an amount greater than zero.'
      );
    end if;

    if v_proof.profile_id is null then
      return jsonb_build_object(
        'ok',
        false,
        'error',
        'This proof is not linked to a driver.'
      );
    end if;

    insert into public.transactions (driver_id, type, amount, created_at)
    values (v_proof.profile_id, 'fuel_repayment', p_amount, now());

    update public.payment_proofs
    set status = 'approved',
        reviewer_notes = p_notes,
        reviewed_at = now(),
        reviewed_by = p_admin_profile_id,
        updated_at = now()
    where id = p_proof_id;
  elsif p_action = 'rejected' then
    if p_notes is null or btrim(p_notes) = '' then
      return jsonb_build_object(
        'ok',
        false,
        'error',
        'A rejection reason is required.'
      );
    end if;

    update public.payment_proofs
    set status = 'rejected',
        reviewer_notes = p_notes,
        reviewed_at = now(),
        reviewed_by = p_admin_profile_id,
        updated_at = now()
    where id = p_proof_id;
  else
    update public.payment_proofs
    set status = 'disputed',
        reviewer_notes = p_notes,
        reviewed_at = now(),
        reviewed_by = p_admin_profile_id,
        updated_at = now()
    where id = p_proof_id;
  end if;

  return jsonb_build_object('ok', true);
end;
$$;

revoke all on function public.review_payment_proof(uuid, uuid, text, numeric, text) from public;
revoke all on function public.review_payment_proof(uuid, uuid, text, numeric, text) from anon, authenticated;
grant execute on function public.review_payment_proof(uuid, uuid, text, numeric, text) to service_role;
