-- Atomic admin actions.
--
-- These RPCs replace multi-step TypeScript writes so profile and ledger
-- mutations commit or roll back as a single PostgreSQL transaction.
-- The weekly fuel limit remains enforced by the existing BEFORE INSERT trigger
-- from migration 046 (transactions_enforce_weekly_fuel_limit).

-- 1. Log a transaction, including streak and unauthorized-overlimit penalty.
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
    p_overlimit_action = 'authorize'
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

-- 2. Create/update the driver profile and sync their vehicle atomically.
create or replace function public.create_driver_profile_and_vehicle(
  p_user_id uuid,
  p_patch jsonb,
  p_vehicle_make_model text default null,
  p_vehicle_registration text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_patch jsonb := coalesce(p_patch, '{}'::jsonb);
  v_profile_id uuid;
  v_vehicle_id uuid;
begin
  if p_user_id is null then
    raise exception 'User is required.' using errcode = '22023';
  end if;

  insert into public.profiles (
    user_id,
    role,
    full_name,
    phone,
    driver_status,
    car_make_model,
    car_registration,
    id_number,
    suburb,
    license_valid,
    years_experience,
    preferred_vehicle_category,
    marketing_source,
    weekly_fuel_limit,
    fuel_code,
    fuel_garage_id,
    payment_due_day,
    payment_due_time,
    payment_arrangement_due_date,
    payment_arrangement_notes,
    payment_arrangement_approved_by,
    updated_at
  )
  values (
    p_user_id,
    'client',
    v_patch ->> 'full_name',
    v_patch ->> 'phone',
    coalesce(v_patch ->> 'driver_status', 'inactive'),
    v_patch ->> 'car_make_model',
    v_patch ->> 'car_registration',
    v_patch ->> 'id_number',
    v_patch ->> 'suburb',
    v_patch ->> 'license_valid',
    v_patch ->> 'years_experience',
    v_patch ->> 'preferred_vehicle_category',
    v_patch ->> 'marketing_source',
    coalesce((v_patch ->> 'weekly_fuel_limit')::numeric, 2000),
    v_patch ->> 'fuel_code',
    (v_patch ->> 'fuel_garage_id')::uuid,
    coalesce(v_patch ->> 'payment_due_day', 'tuesday'),
    coalesce((v_patch ->> 'payment_due_time')::time, '13:00'::time),
    (v_patch ->> 'payment_arrangement_due_date')::date,
    v_patch ->> 'payment_arrangement_notes',
    (v_patch ->> 'payment_arrangement_approved_by')::uuid,
    now()
  )
  on conflict (user_id) do update set
    role = 'client',
    full_name = excluded.full_name,
    phone = excluded.phone,
    driver_status = excluded.driver_status,
    car_make_model = excluded.car_make_model,
    car_registration = excluded.car_registration,
    id_number = excluded.id_number,
    suburb = excluded.suburb,
    license_valid = excluded.license_valid,
    years_experience = excluded.years_experience,
    preferred_vehicle_category = excluded.preferred_vehicle_category,
    marketing_source = excluded.marketing_source,
    weekly_fuel_limit = excluded.weekly_fuel_limit,
    fuel_code = excluded.fuel_code,
    fuel_garage_id = excluded.fuel_garage_id,
    payment_due_day = excluded.payment_due_day,
    payment_due_time = excluded.payment_due_time,
    payment_arrangement_due_date = excluded.payment_arrangement_due_date,
    payment_arrangement_notes = excluded.payment_arrangement_notes,
    payment_arrangement_approved_by = excluded.payment_arrangement_approved_by,
    updated_at = now()
  returning id into v_profile_id;

  if p_vehicle_make_model is not null and p_vehicle_registration is not null then
    select id into v_vehicle_id
    from public.vehicles
    where driver_id = v_profile_id
      and lower(registration) = lower(p_vehicle_registration)
    limit 1
    for update;

    if v_vehicle_id is not null then
      update public.vehicles
      set make_model = p_vehicle_make_model,
          updated_at = now()
      where id = v_vehicle_id;
    else
      select id into v_vehicle_id
      from public.vehicles
      where lower(registration) = lower(p_vehicle_registration)
      limit 1
      for update;

      if v_vehicle_id is not null then
        update public.vehicles
        set driver_id = v_profile_id,
            make_model = p_vehicle_make_model,
            ownership_type = 'own',
            updated_at = now()
        where id = v_vehicle_id;
      else
        insert into public.vehicles (
          driver_id,
          make_model,
          registration,
          ownership_type,
          status
        )
        values (
          v_profile_id,
          p_vehicle_make_model,
          p_vehicle_registration,
          'own',
          'active'
        );
      end if;
    end if;
  end if;

  return v_profile_id;
end;
$$;

-- 3. Update a submission, its lead, and (on approval) the driver profile.
create or replace function public.update_submission_status(
  p_submission_id uuid,
  p_status text,
  p_lead_id uuid,
  p_user_id uuid default null,
  p_profile_patch jsonb default '{}'::jsonb,
  p_lead_source text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_status public.submission_status;
  v_lead_status public.lead_status;
  v_patch jsonb := coalesce(p_profile_patch, '{}'::jsonb);
  v_role text;
begin
  if p_status not in (
    'pending',
    'draft',
    'submitted',
    'in_review',
    'approved',
    'rejected'
  ) then
    return jsonb_build_object('ok', false, 'error', 'Invalid submission status.');
  end if;

  v_status := p_status::public.submission_status;

  if p_user_id is not null then
    select role into v_role
    from public.profiles
    where user_id = p_user_id
    for update;

    if v_role = 'admin' and p_status = 'approved' then
      return jsonb_build_object(
        'ok',
        false,
        'error',
        'Cannot change an admin account through submission approval.'
      );
    end if;
  end if;

  update public.form_submissions
  set status = v_status,
      updated_at = now()
  where id = p_submission_id;

  if not found then
    return jsonb_build_object('ok', false, 'error', 'Submission not found.');
  end if;

  v_lead_status := case
    when p_status in ('approved', 'rejected') then p_status::public.lead_status
    else 'submitted'::public.lead_status
  end;

  update public.leads
  set status = v_lead_status,
      source = coalesce(p_lead_source, source),
      updated_at = now()
  where id = p_lead_id;

  if not found then
    raise exception 'Lead not found.' using errcode = '23503';
  end if;

  if p_status = 'approved' and p_user_id is not null then
    insert into public.profiles (
      user_id,
      role,
      driver_status,
      primary_service,
      id_number,
      suburb,
      license_valid,
      years_experience,
      preferred_vehicle_category,
      marketing_source,
      car_make_model,
      car_registration,
      weekly_fuel_limit,
      fuel_garage_id,
      fuel_code,
      updated_at
    )
    values (
      p_user_id,
      'client',
      coalesce(v_patch ->> 'driver_status', 'active'),
      v_patch ->> 'primary_service',
      v_patch ->> 'id_number',
      v_patch ->> 'suburb',
      v_patch ->> 'license_valid',
      v_patch ->> 'years_experience',
      v_patch ->> 'preferred_vehicle_category',
      v_patch ->> 'marketing_source',
      v_patch ->> 'car_make_model',
      v_patch ->> 'car_registration',
      coalesce((v_patch ->> 'weekly_fuel_limit')::numeric, 2000),
      (v_patch ->> 'fuel_garage_id')::uuid,
      v_patch ->> 'fuel_code',
      now()
    )
    on conflict (user_id) do update set
      role = 'client',
      driver_status = excluded.driver_status,
      primary_service = case
        when v_patch ? 'primary_service' then v_patch ->> 'primary_service'
        else profiles.primary_service
      end,
      id_number = case
        when v_patch ? 'id_number' then v_patch ->> 'id_number'
        else profiles.id_number
      end,
      suburb = case
        when v_patch ? 'suburb' then v_patch ->> 'suburb'
        else profiles.suburb
      end,
      license_valid = case
        when v_patch ? 'license_valid' then v_patch ->> 'license_valid'
        else profiles.license_valid
      end,
      years_experience = case
        when v_patch ? 'years_experience' then v_patch ->> 'years_experience'
        else profiles.years_experience
      end,
      preferred_vehicle_category = case
        when v_patch ? 'preferred_vehicle_category'
          then v_patch ->> 'preferred_vehicle_category'
        else profiles.preferred_vehicle_category
      end,
      marketing_source = case
        when v_patch ? 'marketing_source' then v_patch ->> 'marketing_source'
        else profiles.marketing_source
      end,
      car_make_model = case
        when v_patch ? 'car_make_model' then v_patch ->> 'car_make_model'
        else profiles.car_make_model
      end,
      car_registration = case
        when v_patch ? 'car_registration' then v_patch ->> 'car_registration'
        else profiles.car_registration
      end,
      weekly_fuel_limit = case
        when v_patch ? 'weekly_fuel_limit'
          then (v_patch ->> 'weekly_fuel_limit')::numeric
        else profiles.weekly_fuel_limit
      end,
      fuel_garage_id = case
        when v_patch ? 'fuel_garage_id'
          then (v_patch ->> 'fuel_garage_id')::uuid
        else profiles.fuel_garage_id
      end,
      fuel_code = case
        when v_patch ? 'fuel_code' then v_patch ->> 'fuel_code'
        else profiles.fuel_code
      end,
      updated_at = now();
  end if;

  return jsonb_build_object('ok', true);
end;
$$;

-- 4. Award referral points to both the referral record and referrer profile.
create or replace function public.award_referral_points(
  p_referral_id uuid,
  p_points integer
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_referral public.driver_referrals%rowtype;
begin
  if p_points is null or p_points <= 0 then
    return jsonb_build_object(
      'ok',
      false,
      'error',
      'Enter a whole number of points greater than zero.'
    );
  end if;

  select * into v_referral
  from public.driver_referrals
  where id = p_referral_id
  for update;

  if not found then
    return jsonb_build_object('ok', false, 'error', 'Referral not found.');
  end if;

  update public.driver_referrals
  set points_earned = coalesce(points_earned, 0) + p_points,
      status = 'rewarded',
      reward_processed_at = now(),
      updated_at = now()
  where id = p_referral_id;

  update public.profiles
  set points_balance = coalesce(points_balance, 0) + p_points,
      lifetime_points_earned = coalesce(lifetime_points_earned, 0) + p_points,
      updated_at = now()
  where id = v_referral.referrer_id;

  if not found then
    raise exception 'Referrer not found.' using errcode = '23503';
  end if;

  return jsonb_build_object(
    'ok',
    true,
    'referrer_id',
    v_referral.referrer_id
  );
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

revoke all on function public.create_driver_profile_and_vehicle(
  uuid, jsonb, text, text
) from public;
revoke all on function public.create_driver_profile_and_vehicle(
  uuid, jsonb, text, text
) from anon, authenticated;
grant execute on function public.create_driver_profile_and_vehicle(
  uuid, jsonb, text, text
) to service_role;

revoke all on function public.update_submission_status(
  uuid, text, uuid, uuid, jsonb, text
) from public;
revoke all on function public.update_submission_status(
  uuid, text, uuid, uuid, jsonb, text
) from anon, authenticated;
grant execute on function public.update_submission_status(
  uuid, text, uuid, uuid, jsonb, text
) to service_role;

revoke all on function public.award_referral_points(uuid, integer) from public;
revoke all on function public.award_referral_points(uuid, integer) from anon, authenticated;
grant execute on function public.award_referral_points(uuid, integer) to service_role;
