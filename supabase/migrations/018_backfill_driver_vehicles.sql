-- Backfill driver profiles with car details into the vehicles table as 'own'
-- vehicles. Saving a driver profile now syncs this automatically; this
-- migration handles drivers that already exist so they don't need re-saving.

do $$
declare
  profile_row record;
  existing_vehicle_id uuid;
begin
  for profile_row in
    select p.id as profile_id, p.car_make_model, p.car_registration
    from public.profiles p
    where p.car_make_model is not null
      and p.car_registration is not null
      and coalesce(p.role, 'client') <> 'admin'
  loop
    -- Skip if this driver already has an 'own' vehicle with the same plate.
    select v.id into existing_vehicle_id
    from public.vehicles v
    where v.driver_id = profile_row.profile_id
      and lower(v.registration) = lower(profile_row.car_registration)
    limit 1;

    if existing_vehicle_id is null then
      -- Reuse an existing vehicle with the same plate (avoids the unique
      -- case-insensitive registration index) before creating a new one.
      select v.id into existing_vehicle_id
      from public.vehicles v
      where lower(v.registration) = lower(profile_row.car_registration)
      limit 1;

      if existing_vehicle_id is null then
        insert into public.vehicles (
          driver_id,
          make_model,
          registration,
          ownership_type,
          status
        ) values (
          profile_row.profile_id,
          profile_row.car_make_model,
          profile_row.car_registration,
          'own',
          'active'
        );
      else
        update public.vehicles
        set driver_id = profile_row.profile_id,
            make_model = profile_row.car_make_model,
            ownership_type = 'own',
            updated_at = now()
        where id = existing_vehicle_id;
      end if;
    end if;
  end loop;
end $$;