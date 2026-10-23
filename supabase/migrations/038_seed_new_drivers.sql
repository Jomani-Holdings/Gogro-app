-- Seed new driver profiles, auth users, and vehicles for Marlborough AE.
-- Source: Driver List_Go Gro App.xlsx, selected rows.
-- Created: 2026-10-21
--
-- Behavior:
--   * Creates auth.users + auth.identities for each selected driver.
--   * Lets handle_new_user trigger create the public.profiles row, then updates it.
--   * Inserts a public.vehicles row linked to the profile.
--   * Skips rows where the email already exists in auth.users or the registration
--     already exists in public.vehicles, logging the skip reason.
--   * All seeded drivers are set to driver_status = 'inactive'.

-- Staging table for the spreadsheet rows we want to seed.
create temporary table _seed_drivers (
  line int not null,
  full_name text not null,
  phone text,
  email text not null,
  fuel_garage_search text not null,
  fuel_code text not null,
  weekly_fuel_limit numeric not null,
  ehailing_platform text,
  vehicle_make_model text not null,
  vehicle_registration text not null,
  vehicle_ownership_type text not null,
  password text not null
);

-- Result log so the operator can see what happened per row.
create temporary table _seed_results (
  line int,
  full_name text,
  email text,
  registration text,
  status text,
  note text
);

-- Garage abbreviation mapping.
create temporary table _garage_map (
  search_term text primary key,
  garage_id uuid not null
);

insert into _garage_map (search_term, garage_id) values
  ('Marlborough AE', '66b512fc-d360-4681-9379-b37cf55d91dc');

-- Selected rows from the spreadsheet (row 55 omitted due to missing data).
insert into _seed_drivers (
  line, full_name, phone, email, fuel_garage_search, fuel_code,
  weekly_fuel_limit, ehailing_platform, vehicle_make_model, vehicle_registration,
  vehicle_ownership_type, password
) values
  (2, 'Cuthbert Chivange', null, 'slydonbadzaw90@gmail.com', 'Marlborough AE', '49', 2000, 'UBER', 'Suzuki Dzire (white)', 'CF310537', 'Fleet', 'Gro@LE5koiUr'),
  (3, 'Promise Tinashe', null, 'promisenyabando@gmail.com', 'Marlborough AE', '50', 2000, 'UBER', 'Hyundai i10 (Silver)', 'CAA 613 001', 'Fleet', 'Gro@ugFU4qzK'),
  (4, 'Takudzwa Taura', null, 'tauratakudzwa90@gmail.com', 'Marlborough AE', '53', 2000, 'UBER', 'Suzuki Swift (Silver)', 'CF 358 720', 'Fleet', 'Gro@NdfUgsd2'),
  (5, 'Blessing Owen Nyakusanhwa', null, 'Nyakusanhwablessing@gmail.com', 'Marlborough AE', '54', 2000, 'UBER', 'VW Polo Hatchback (Grey)', 'CF 305 195', 'Own car', 'Gro@dRbfWyJd'),
  (8, 'Pumlani Chakanyuka', null, 'chakanyukabelieve8@gmail.com', 'Marlborough AE', '57', 2000, 'UBER', 'Honda BRV (Dark Grey)', 'CAA 152 332', 'Own car', 'Gro@ERIhDOqi'),
  (9, 'Melatha mubariri', null, 'Melathamubariri4@gmail.com', 'Marlborough AE', '58', 2000, 'UBER', 'Hyundai i10 (Silver)', 'CF358635', 'Own car', 'Gro@XXJuKJlD'),
  (10, 'Munyaradzi Damitoni', null, 'damitonimunyaradzi@hotmail.com', 'Marlborough AE', '59', 2000, 'UBER', 'Voolkswagen Polo', 'CAA 490 940', 'Own car', 'Gro@iFyxsE7v'),
  (11, 'John Nyasulu', null, 'juniorchakwanika2@gmail.com', 'Marlborough AE', '60', 2000, 'UBER', 'Suzuki Celerio (White)', 'CF 371 450', 'Own car', 'Gro@ZsC6qxlt'),
  (14, 'Grace Zimbeva', null, 'priviledgezimbeva99@gmail.com', 'Marlborough AE', '63', 2000, 'UBER', 'Mitsubishi Mirage', 'CY 255721', 'Own car', 'Gro@P8CDSEv3'),
  (16, 'Tapiwa Masiiwa', null, 'kingsuzukicape@gmail.com', 'Marlborough AE', '65', 2000, 'UBER', 'Renault triber 2024 Blue', 'CAA 650658', 'Own car', 'Gro@btRlqArc'),
  (17, 'Ennias Mdenhwa', null, '85w8sridttdtido@gmail.com', 'Marlborough AE', '66', 2500, 'UBER', 'Suzuki Dzire (white)', 'CF 320 181', 'Own car', 'Gro@kz3XGyqs'),
  (18, 'Aya Jolobe', null, 'aya.jolobe@gmail.com', 'Marlborough AE', '67', 2000, 'UBER', 'Toyota Corolla (White)', 'CAA 662 275', 'Own car', 'Gro@xxM9Ezq2'),
  (21, 'Proficient Munashe', null, 'profmunashe1998@gmail.com', 'Marlborough AE', '71', 2000, 'UBER', 'Suzuki Espresso (Silver)', 'CAA 349 101', 'Own car', 'Gro@dWIHlx0i'),
  (22, 'Tinashe Chinodakufa', null, 'alvinshumbaa@gmail.com', 'Marlborough AE', '72', 2000, 'UBER', 'Suzuki Dzire (White)', 'CY339552', 'Own car', 'Gro@qwmiSvyN'),
  (24, 'Muchazoreka mugebe', null, 'Mugebe1712@gmail.com', 'Marlborough AE', '75', 2000, 'UBER', 'BMW 5 Series (White)', 'CAA 501 504', 'Own car', 'Gro@OVmFJKJ5'),
  (26, 'Sylvin Vatara', null, 'slymurwira7@gmail.com', 'Marlborough AE', '78', 2000, 'UBER', 'Volkswagen Polo (White)', 'CF 299 103', 'Own car', 'Gro@WvxWKa3c'),
  (31, 'Isiah Jaunda', null, 'jaundaisiah3@gmail.com', 'Marlborough AE', '86', 2000, 'UBER', 'Hyundai Grand i10 (white)', 'CAA681021', 'Own car', 'Gro@1ijY3pLT'),
  (34, 'Vusi Siya Bhengu', null, 'visisiyabhengu@gmail.com', 'Marlborough AE', '90', 2000, 'UBER', 'Volkswagen, Polo,', 'CF 374 367', 'Own car', 'Gro@ZETXAjy3');

do $$
declare
  d record;
  uid uuid;
  pid uuid;
  gid uuid;
  ownership vehicle_ownership;
  email_exists boolean;
  reg_exists boolean;
begin
  for d in select * from _seed_drivers order by line loop
    -- Map ownership type.
    ownership := case lower(trim(d.vehicle_ownership_type))
      when 'own car' then 'own'::vehicle_ownership
      when 'fleet' then 'managed'::vehicle_ownership
      else null
    end;

    -- Resolve fuel garage.
    select garage_id into gid
    from _garage_map
    where lower(trim(search_term)) = lower(trim(d.fuel_garage_search));

    -- Skip if email already exists.
    select exists(
      select 1 from auth.users where lower(email) = lower(trim(d.email))
    ) into email_exists;

    if email_exists then
      insert into _seed_results (line, full_name, email, registration, status, note)
      values (d.line, d.full_name, d.email, d.vehicle_registration, 'skipped', 'email already exists in auth.users');
      continue;
    end if;

    -- Skip if registration already exists.
    select exists(
      select 1 from public.vehicles where lower(registration) = lower(trim(d.vehicle_registration))
    ) into reg_exists;

    if reg_exists then
      insert into _seed_results (line, full_name, email, registration, status, note)
      values (d.line, d.full_name, d.email, d.vehicle_registration, 'skipped', 'registration already exists in public.vehicles');
      continue;
    end if;

    uid := gen_random_uuid();

    -- 1. Auth user.
    insert into auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      confirmation_token,
      recovery_token,
      email_change_token_new,
      email_change,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at
    ) values (
      '00000000-0000-0000-0000-000000000000',
      uid,
      'authenticated',
      'authenticated',
      trim(d.email),
      extensions.crypt(d.password, extensions.gen_salt('bf', 10)),
      now(),
      '',
      '',
      '',
      '',
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('email_verified', true, 'full_name', d.full_name),
      now(),
      now()
    );

    -- 2. Auth identity (required for email/password login).
    insert into auth.identities (
      provider_id,
      user_id,
      identity_data,
      provider,
      created_at,
      updated_at
    ) values (
      uid,
      uid,
      jsonb_build_object('sub', uid::text, 'email', trim(d.email), 'email_verified', false, 'phone_verified', false),
      'email',
      now(),
      now()
    );

    -- 3. Profile was created by handle_new_user trigger; update it.
    select id into pid from public.profiles where user_id = uid;

    update public.profiles
    set
      full_name = d.full_name,
      email = trim(d.email),
      phone = nullif(trim(d.phone), ''),
      driver_status = 'inactive',
      car_make_model = d.vehicle_make_model,
      car_registration = d.vehicle_registration,
      weekly_fuel_limit = d.weekly_fuel_limit,
      fuel_code = d.fuel_code,
      fuel_garage_id = gid
    where id = pid;

    -- 4. Vehicle.
    insert into public.vehicles (
      make_model,
      registration,
      driver_id,
      ownership_type,
      status
    ) values (
      d.vehicle_make_model,
      d.vehicle_registration,
      pid,
      ownership,
      'active'
    );

    insert into _seed_results (line, full_name, email, registration, status, note)
    values (d.line, d.full_name, d.email, d.vehicle_registration, 'created', null);
  end loop;
end $$;

-- Show the outcome.
select * from _seed_results order by line;
