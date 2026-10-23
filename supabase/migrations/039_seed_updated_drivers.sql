-- Seed updated driver list from Driver List_Go Gro App.xlsx
-- Created: 2026-10-22
-- Behavior:
--   * Creates auth.users + auth.identities for each complete, non-duplicate driver.
--   * Lets handle_new_user trigger create public.profiles, then updates them.
--   * Inserts public.vehicles linked to the profile.
--   * Skips rows with incomplete details, existing emails, existing registrations,
--     duplicate CSV entries, or unknown garages.
--   * All seeded drivers are set to driver_status = 'inactive'.

create temporary table _seed_drivers (
  line int not null,
  full_name text not null,
  phone text,
  email text,
  fuel_garage_search text,
  fuel_code text,
  weekly_fuel_limit numeric,
  ehailing_platform text,
  vehicle_make_model text,
  vehicle_registration text,
  vehicle_ownership_type text,
  password text
);

create temporary table _seed_results (
  line int,
  full_name text,
  email text,
  registration text,
  status text,
  reasons text
);

create temporary table _garage_map (
  search_term text primary key,
  garage_id uuid not null
);

insert into _garage_map (search_term, garage_id) values
  ('Marlborough AE', '66b512fc-d360-4681-9379-b37cf55d91dc'::uuid),
  ('Goodwood AE', '2bf5c085-b16c-448f-a22b-aa79f74c871a'::uuid);

insert into _seed_drivers (
  line, full_name, phone, email, fuel_garage_search, fuel_code,
  weekly_fuel_limit, ehailing_platform, vehicle_make_model, vehicle_registration,
  vehicle_ownership_type, password
) values
  (2, 'Cuthbert Chivange', NULL, 'slydonbadzaw90@gmail.com', 'Marlborough AE', '49', 2000, 'UBER', 'Suzuki Dzire (white)', 'CF310537', 'Fleet', 'Gro@LE5koiUr'),
  (3, 'Promise Tinashe', NULL, 'promisenyabando@gmail.com', 'Marlborough AE', '50', 2000, 'UBER', 'Hyundai i10 (Silver)', 'CAA 613 001', 'Fleet', 'Gro@ugFU4qzK'),
  (4, 'Takudzwa Taura', NULL, 'tauratakudzwa90@gmail.com', 'Marlborough AE', '53', 2000, 'UBER', 'Suzuki Swift (Silver)', 'CF 358 720', 'Fleet', 'Gro@NdfUgsd2'),
  (5, 'Blessing Owen Nyakusanhwa', NULL, 'Nyakusanhwablessing@gmail.com', 'Marlborough AE', '54', 2000, 'UBER', 'VW Polo Hatchback (Grey)', 'CF 305 195', 'Own car', 'Gro@dRbfWyJd'),
  (6, 'Cherera Munyaradzi', NULL, '', 'Marlborough AE', '55', 2000, 'UBER', 'Toyota Agya (White)', 'CFM 99904', 'Own car', 'Gro@21mphACW'),
  (7, 'Aaron Masunda', NULL, '', 'Marlborough AE', '56', 2500, 'UBER', 'Audi A4 (White)', 'CY 481 937', 'Own car', 'Gro@XessjkbL'),
  (8, 'Pumlani Chakanyuka', NULL, 'chakanyukabelieve8@gmail.com', 'Marlborough AE', '57', 2000, 'UBER', 'Honda BRV (Dark Grey)', 'CAA 152 332', 'Own car', 'Gro@ERIhDOqi'),
  (9, 'Melatha mubariri', NULL, 'Melathamubariri4@gmail.com', 'Marlborough AE', '58', 2000, 'UBER', 'Hyundai i10 (Silver)', 'CF358635', 'Own car', 'Gro@XXJuKJlD'),
  (10, 'Munyaradzi Damitoni', NULL, 'damitonimunyaradzi@hotmail.com', 'Marlborough AE', '59', 2000, 'UBER', 'Voolkswagen Polo', 'CAA 490 940', 'Own car', 'Gro@iFyxsE7v'),
  (11, 'John Nyasulu', NULL, 'juniorchakwanika2@gmail.com', 'Marlborough AE', '60', 2000, 'UBER', 'Suzuki Celerio (White)', 'CF 371 450', 'Own car', 'Gro@ZsC6qxlt'),
  (12, 'Eliezer (Simon) Kusotera', NULL, 'elkusotera@gmail.com', 'Marlborough AE', '61', 2000, 'UBER', 'Suzuki Swift (silver)', 'CAA541033', 'Own car', 'Gro@lvtZiszT'),
  (13, 'Terence Ranganayi', NULL, '', 'Marlborough AE', '62', 2000, 'UBER', 'Toyota Avanza (White)', 'CY 416271', 'Own car', 'Gro@XGQoITDY'),
  (14, 'Grace Zimbeva', NULL, 'priviledgezimbeva99@gmail.com', 'Marlborough AE', '63', 2000, 'UBER', 'Mitsubishi Mirage', 'CY 255721', 'Own car', 'Gro@P8CDSEv3'),
  (15, 'Steven Kamudzandu', NULL, '', 'Marlborough AE', '64', 2000, 'UBER', 'Volkswagen Polo (White)', 'CY 455 596', 'Own car', 'Gro@cVe1lDOF'),
  (16, 'Tapiwa Masiiwa', NULL, 'kingsuzukicape@gmail.com', 'Marlborough AE', '65', 2000, 'UBER', 'Renault triber 2024 Blue', 'CAA 650658', 'Own car', 'Gro@btRlqArc'),
  (17, 'Ennias Mdenhwa', NULL, '85w8sridttdtido@gmail.com', 'Marlborough AE', '66', 2500, 'UBER', 'Suzuki Dzire (white)', 'CF 320 181', 'Own car', 'Gro@kz3XGyqs'),
  (18, 'Aya Jolobe', NULL, 'aya.jolobe@gmail.com', 'Marlborough AE', '67', 2000, 'UBER', 'Toyota Corolla (White)', 'CAA 662 275', 'Own car', 'Gro@xxM9Ezq2'),
  (19, 'Alexander Gore', NULL, 'Gorealexsie6@gmail.com', 'Marlborough AE', '68', 2000, 'UBER', 'Volkswagen Polo (White)', 'CAA 551 796', 'Own car', 'Gro@VMBarXYm'),
  (20, 'Gay Machacha', NULL, '', 'Marlborough AE', '69', 2000, 'UBER', 'BMW 2025', 'CAA 752213', 'Own car', 'Gro@ic3zGJyD'),
  (21, 'Proficient Munashe', NULL, 'profmunashe1998@gmail.com', 'Marlborough AE', '71', 2000, 'UBER', 'Suzuki Espresso (Silver)', 'CAA 349 101', 'Own car', 'Gro@dWIHlx0i'),
  (22, 'Tinashe Chinodakufa', NULL, 'alvinshumbaa@gmail.com', 'Marlborough AE', '72', 2000, 'UBER', 'Suzuki Dzire (White)', 'CY339552', 'Own car', 'Gro@qwmiSvyN'),
  (23, 'Godknows Chitongwe', NULL, 'adonischito@gmail.com', 'Marlborough AE', '73', 2000, 'UBER', 'Volkswagen Polo', 'CY 445 710', 'Own car', 'Gro@IGZInsAk'),
  (24, 'Muchazoreka mugebe', NULL, 'Mugebe1712@gmail.com', 'Marlborough AE', '75', 2000, 'UBER', 'BMW 5 Series (White)', 'CAA 501 504', 'Own car', 'Gro@OVmFJKJ5'),
  (25, 'Tinotenda Rwafa', NULL, '', 'Marlborough AE', '77', 2000, 'UBER', 'Toyota Corolla Quest (White)', 'CF 357 087', 'Own car', 'Gro@ErifY4Tr'),
  (26, 'Sylvin Vatara', NULL, 'slymurwira7@gmail.com', 'Marlborough AE', '78', 2000, 'UBER', 'Volkswagen Polo (White)', 'CF 299 103', 'Own car', 'Gro@WvxWKa3c'),
  (27, 'Betty Gangata', NULL, '', 'Marlborough AE', '79', 2000, 'UBER', 'Hyundai grand i10', 'CF268593', 'Own car', 'Gro@eFggEI7L'),
  (28, 'Cynthia Munyai', NULL, '', 'Marlborough AE', '81', 2000, 'UBER', 'Hyundai i20 (White)', 'CY 299 297', 'Own car', 'Gro@ogra8FUU'),
  (29, 'Tongesai Taderera', NULL, '', 'Marlborough AE', '82', 2000, 'UBER', 'Volkswagen Polo (White)', 'CAA 606 655', 'Own car', 'Gro@0o8zHUQV'),
  (30, 'Keabetswe Mothibi', NULL, '', 'Marlborough AE', '83', 2000, 'UBER', 'Suzuki Celerio (White)', 'CF 371 450', 'Own car', 'Gro@MqMVkcUU'),
  (31, 'Isiah Jaunda', NULL, 'jaundaisiah3@gmail.com', 'Marlborough AE', '86', 2000, 'UBER', 'Hyundai Grand i10 (white)', 'CAA681021', 'Own car', 'Gro@1ijY3pLT'),
  (32, 'Albert Tinashe Chitiyo', NULL, '', 'Marlborough AE', '87', 2000, 'UBER', 'Volkswgane Polo (White)', 'CY 480021', 'Own car', 'Gro@PHs0lVQv'),
  (33, 'Alec Tanyanyiwa', NULL, '', 'Marlborough AE', '88', 2000, 'UBER', 'Hyundai Grand (White)', 'CAA 681 021', 'Own car', 'Gro@Ugv1IlnZ'),
  (34, 'Vusi Siya Bhengu', NULL, 'visisiyabhengu@gmail.com', 'Marlborough AE', '90', 2000, 'UBER', 'Volkswagen, Polo,', 'CF 374 367', 'Own car', 'Gro@ZETXAjy3'),
  (35, 'Tafadzwa Chikera', NULL, '', 'Marlborough AE', '91', 2000, 'UBER', 'Honda BRV (White)', 'CF 369 197', 'Own car', 'Gro@zFZCTGiE'),
  (36, 'Sibusiso Bheki Zikhali', NULL, 'Zikhalisbusisobheki@gmail.com', 'Marlborough AE', '93', 2000, 'UBER', 'BMW 3 Series (White)', 'CAA 604 852', 'Own car', 'Gro@kQ5n2Xvt'),
  (37, 'Moses Ngilane', NULL, '', 'Marlborough AE', '95', 2000, 'UBER', 'Suzuki Dzire (white)', 'CF 307 291', 'Own car', 'Gro@PFZx55UN'),
  (38, 'Trymore Chidhakwa', NULL, 'trymorechidhakwa@gmail.com', 'Marlborough AE', '96', 2000, 'UBER', 'Toyota Etios (White)', 'CAA 601 015', 'Own car', 'Gro@33BGj8DZ'),
  (39, 'Tafadzwa Mutandiri', NULL, '', 'Marlborough AE', '97', 2000, 'UBER', 'Toyota Corrolla (White)', 'CA 216 377', 'Own car', 'Gro@3uOYW9Uk'),
  (40, 'Alistair Zodzi', NULL, 'alistairzodzi0@gmail.com', 'Marlborough AE', '101', 2000, 'UBER', 'Hyundai Atos (White)', 'CY 458 457', 'Own car', 'Gro@8RsrxJFx'),
  (41, 'James Matumba', NULL, '', 'Marlborough AE', '102', 2000, 'UBER', 'TOYOTA RUMION (WHITE)', 'CAA 362 781', 'Own car', 'Gro@5cZYwoJ4'),
  (42, 'Courage Moses Mapurisa', NULL, '', 'Marlborough AE', '103', 2000, 'UBER', 'Toyota Etios (White)', 'CAA 386 193', 'Own car', 'Gro@qj9gODWh'),
  (43, 'Alfred Rambwawasvika', NULL, '', 'Marlborough AE', '104', 2000, 'UBER', 'Toyota Corolla (White)', 'CAA 186 094', 'Own car', 'Gro@mw1zsrG5'),
  (44, 'Tawanda Zvakafa', NULL, '', 'Marlborough AE', '105', 2000, 'UBER', 'Suzuki Ertiga (White)', 'CF 705 724', 'Own car', 'Gro@zUqdL6Ud'),
  (45, 'Wellington Chikaura', NULL, 'wellingtonchikaura326@gmail.com', 'Marlborough AE', '106', 2000, 'UBER', 'Toyota Etios Sedan (White)', 'CY125279', 'Own car', 'Gro@izCvIFFW'),
  (46, 'Ashelee Reason Musiwa', NULL, '', 'Marlborough AE', '108', 2000, 'UBER', 'Volkswagen Polo (White)', 'CAA 740 360', 'Own car', 'Gro@dVGDyw28'),
  (47, 'Owen John Mazhakata', NULL, 'Owenjonesmazhakata01@gmail.com', 'Marlborough AE', '109', 2000, 'UBER', 'Suzuki Ciaz (White)', 'CF 366 267', 'Own car', 'Gro@k7Gp17oV'),
  (48, 'Temba Collice Tembo', NULL, '', 'Marlborough AE', '114', 2000, 'UBER', 'Toyota Corrola Quest (White)', 'CAA690362', 'Own car', 'Gro@9S3dikbu'),
  (49, 'Russel Banza', NULL, '', 'Marlborough AE', '115', 2000, 'UBER', 'Volkswagen Polo (White)', 'CY468390', 'Own car', 'Gro@StoEiD1z'),
  (50, 'Russel Banza', NULL, '', 'Marlborough AE', '117', 2000, 'UBER', 'Mercedes Benz C180 (Silver)', 'CF 372 615', 'Own car', 'Gro@jm5pkkmI'),
  (51, 'Alexander Gore', NULL, '', 'Marlborough AE', '118', 2000, 'UBER', 'Hyundai Atos (Red)', 'CF 371 478', 'Own car', 'Gro@1SNCsbPU'),
  (52, 'Paddington Nemhara', NULL, '', 'Marlborough AE', '120', 2000, 'UBER', 'Hyundai Grand i10 (Orange)', 'CJ 49415', 'Own car', ''),
  (53, 'Behaviour Chabaya', NULL, '', 'Marlborough AE', '121', 2000, 'UBER', 'Audi A6 Sedan (Grey)', 'CAA297727', 'Own car', ''),
  (54, 'FREDDY MANYUWA', NULL, 'Freddymanyuwa9@gmail.com', 'Marlborough AE', '122', 2000, 'UBER', 'AUDI A3 2016', 'CAA 354 838', 'Own car', '12345678aA'),
  (55, 'Terik Simbarasha Tapera', NULL, 'lafamilialbum@gmail.com', 'Marlborough AE', '123', 2000, 'UBER', 'Toyota Vitz (White)', 'CF 195 205', 'Own car', '12345678aA'),
  (56, 'Ronald Matenda', NULL, '', 'Goodwood AE', 'CAA 360 856', 2000, 'UBER', 'toyota Corolla quest', 'CAA 360 856', 'Own car', ''),
  (57, 'Tafadzwa Chinava', NULL, '', 'Goodwood AE', 'CF 185 200', 2000, 'UBER', 'Volkswagen Polo sedan (White)', 'CF 185 200', 'Own car', ''),
  (58, 'Watson Tokowoyo', NULL, '', 'Goodwood AE', 'CAA 458 627', 2000, 'UBER', 'Toyota Corrola (White)', 'CAA 458 627', 'Own car', ''),
  (59, 'Tawanda K Tom', NULL, '', 'Goodwood AE', 'CAA91567', 2000, 'UBER', 'Kia Sportage', 'CAA91567', 'Own car', ''),
  (60, 'Wilfred Kachara', NULL, '', 'Goodwood AE', 'CF 313 312', 2000, 'UBER', 'VW Polo Hatchback (Silver)', 'CF 313 312', 'Own car', ''),
  (61, 'Tinashe Chiweshe', NULL, 'chiweshet001@gmail.com', 'Goodwood AE', 'CJ93418', 2000, 'UBER', 'Hyndai i10 (White)', 'CJ93418', 'Own car', '12345678aA'),
  (62, 'Petros Kadzere', NULL, '', 'Goodwood AE', 'CF 215017', 2000, 'UBER', 'Suzuki Dzire (white)', 'CF 215017', 'Own car', ''),
  (63, 'Learnmore Tanyanyiwa', NULL, 'Itepavingtreefellingco@gmail.com', 'Goodwood AE', 'CAA 698 653', 2000, 'UBER', 'BMW 320i (Silver)', 'CAA 698 653', 'Own car', '12345678aA'),
  (64, 'Linear Jaisi', NULL, 'Linearj94@gmail.com', 'Goodwood AE', 'CF364428', 2000, 'UBER', 'Honda BRV ( White)', 'CF364428', 'Own car', '12345678aA'),
  (65, 'Tapiwa Manomano', NULL, '', 'Goodwood AE', 'CAA 623 145', 2000, 'UBER', 'Nissan Almera sedan (White)', 'CAA 623 145', 'Own car', ''),
  (66, 'Tirivashe Matore', NULL, '', 'Goodwood AE', 'CY 402 241', 2000, 'UBER', 'Volkswagen Polo (Silver)', 'CY 402 241', 'Own car', ''),
  (67, 'Tirivashe Matore', NULL, 'tirrimatore@gmail.com', 'Goodwood AE', 'CEY 58572', 2000, 'UBER', 'Toyota Corolla (White)', 'CEY 58572', 'Own car', '12345678aA'),
  (68, 'Kudakwashe Mudzingwa', NULL, '', 'Goodwood AE', 'CAA 254 644', 2000, 'UBER', 'Honda BRV (Grey)', 'CAA 254 644', 'Own car', ''),
  (69, 'Ediward Yeremia', NULL, 'Yeremiaeddy@gmail.com', 'Goodwood AE', 'CY123388', 2000, 'UBER', 'Hyundai accent', 'CY123388', 'Own car', '12345678aA'),
  (70, 'Rasheed Henry', NULL, '', 'Goodwood AE', 'CAA626500', 2000, 'UBER', 'Toyota starlet (Grey)', 'CAA626500', 'Own car', ''),
  (71, 'Takawira Muhwati', NULL, 'takawiramuhwati25@gmail.com', 'Goodwood AE', 'CAA 752 213', 2000, 'UBER', 'BMW G20 (White)', 'CAA 752 213', 'Own car', '12345678aA'),
  (72, 'Stephen Zitsato', NULL, '', 'Goodwood AE', 'CY304980', 2000, 'UBER', 'Hyundai Accent', 'CY304980', 'Own car', ''),
  (73, 'Tatenda Joni chatora', NULL, 'tchatora2@gmail.com', 'Goodwood AE', 'CAA660178', 2000, 'UBER', 'Toyota etios', 'CAA660178', 'Own car', '12345678aA'),
  (74, 'Elias Musanda', NULL, '', 'Goodwood AE', 'CY 148 515', 2000, 'UBER', 'Toyota Corolla Quest', 'CY 148 515', 'Own car', ''),
  (75, 'Solomon Tatayi', NULL, '', 'Goodwood AE', 'CAA146-782', 2000, 'UBER', 'Toyota Etios 2020', 'CAA146-782', 'Own car', ''),
  (76, 'Tinashe Mutandwa', NULL, 'mutandwa85@gmail.com', 'Goodwood AE', 'CFM 99904', 2000, 'UBER', 'Toyota Agya', 'CFM 99904', 'Own car', '12345678aA'),
  (77, 'Bruce Rumani', NULL, '', 'Goodwood AE', 'CAA701620', 2000, 'UBER', 'Vw polo 2019', 'CAA701620', 'Own car', ''),
  (78, 'Munyaradzi Muzirecho', NULL, '', 'Goodwood AE', 'CAA 650 802', 2000, 'UBER', 'Hyundai accent 2016', 'CAA 650 802', 'Own car', ''),
  (79, 'Amen Mukodza', NULL, 'mukodzwaamen@gmail.com', 'Goodwood AE', 'DM26GMZN', 2000, 'UBER', 'Kia Pegas (Grey)', 'DM26GMZN', 'Own car', '12345678aA'),
  (80, 'Alfred Mirisau', NULL, 'Kmirisau@gmail.com', 'Goodwood AE', 'CY 139 598', 2000, 'UBER', 'Toyota etios', 'CY 139 598', 'Own car', '12345678aA'),
  (81, 'Primrose Makadaya', NULL, 'primmaka2@gmail.com', 'Goodwood AE', 'CAA544523', 2000, 'UBER', 'Renault triber 2026', 'CAA544523', 'Own car', '12345678aA'),
  (82, 'Pamela Gororo', NULL, 'gororopamela334@gmail.com', 'Goodwood AE', 'CAA648193', 2000, 'UBER', 'Suzuki celerio 2020', 'CAA648193', 'Own car', '12345678aA');

do $$
declare
  d record;
  uid uuid;
  pid uuid;
  gid uuid;
  ownership vehicle_ownership;
  reasons text[];
  email_exists boolean;
  reg_exists boolean;
  seen_emails jsonb := '{}';
  seen_regs jsonb := '{}';
begin
  for d in select * from _seed_drivers order by line loop
    reasons := array[]::text[];

    -- Completeness checks
    if nullif(trim(d.full_name), '') is null then
      reasons := array_append(reasons, 'missing full_name');
    end if;
    if nullif(trim(d.email), '') is null then
      reasons := array_append(reasons, 'missing email');
    end if;
    if nullif(trim(d.password), '') is null then
      reasons := array_append(reasons, 'missing password');
    end if;
    if nullif(trim(d.vehicle_make_model), '') is null then
      reasons := array_append(reasons, 'missing vehicle_make_model');
    end if;
    if nullif(trim(d.vehicle_registration), '') is null then
      reasons := array_append(reasons, 'missing vehicle_registration');
    end if;
    if nullif(trim(d.vehicle_ownership_type), '') is null then
      reasons := array_append(reasons, 'missing vehicle_ownership_type');
    end if;

    -- Garage mapping
    select garage_id into gid
    from _garage_map
    where lower(trim(search_term)) = lower(trim(d.fuel_garage_search));

    if gid is null and nullif(trim(d.fuel_garage_search), '') is not null then
      reasons := array_append(reasons, 'unknown garage: ' || d.fuel_garage_search);
    end if;

    -- Existing checks
    select exists(
      select 1 from auth.users where lower(email) = lower(trim(d.email))
    ) into email_exists;

    if email_exists then
      reasons := array_append(reasons, 'email already exists in auth.users');
    end if;

    select exists(
      select 1 from public.vehicles where lower(registration) = lower(trim(d.vehicle_registration))
    ) into reg_exists;

    if reg_exists then
      reasons := array_append(reasons, 'registration already exists in public.vehicles');
    end if;

    -- Duplicate checks within CSV
    if seen_emails ? lower(trim(d.email)) then
      reasons := array_append(reasons, 'duplicate email in CSV');
    elsif nullif(trim(d.email), '') is not null then
      seen_emails := seen_emails || jsonb_build_object(lower(trim(d.email)), d.line);
    end if;

    if seen_regs ? lower(trim(d.vehicle_registration)) then
      reasons := array_append(reasons, 'duplicate registration in CSV');
    elsif nullif(trim(d.vehicle_registration), '') is not null then
      seen_regs := seen_regs || jsonb_build_object(lower(trim(d.vehicle_registration)), d.line);
    end if;

    if array_length(reasons, 1) > 0 then
      insert into _seed_results (line, full_name, email, registration, status, reasons)
      values (d.line, d.full_name, d.email, d.vehicle_registration, 'skipped', array_to_string(reasons, '; '));
      continue;
    end if;

    -- Map ownership
    ownership := case lower(trim(d.vehicle_ownership_type))
      when 'own car' then 'own'::vehicle_ownership
      when 'fleet' then 'managed'::vehicle_ownership
      else 'own'::vehicle_ownership
    end;

    uid := gen_random_uuid();

    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, confirmation_token, recovery_token,
      email_change_token_new, email_change, raw_app_meta_data,
      raw_user_meta_data, created_at, updated_at
    ) values (
      '00000000-0000-0000-0000-000000000000',
      uid, 'authenticated', 'authenticated', trim(d.email),
      extensions.crypt(d.password, extensions.gen_salt('bf', 10)),
      now(), '', '', '', '',
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('email_verified', true, 'full_name', d.full_name),
      now(), now()
    );

    insert into auth.identities (
      provider_id, user_id, identity_data, provider, created_at, updated_at
    ) values (
      uid, uid,
      jsonb_build_object('sub', uid::text, 'email', trim(d.email), 'email_verified', false, 'phone_verified', false),
      'email', now(), now()
    );

    select id into pid from public.profiles where user_id = uid;

    update public.profiles set
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

    insert into public.vehicles (
      make_model, registration, driver_id, ownership_type, status
    ) values (
      d.vehicle_make_model, d.vehicle_registration, pid, ownership, 'active'
    );

    insert into _seed_results (line, full_name, email, registration, status, reasons)
    values (d.line, d.full_name, d.email, d.vehicle_registration, 'created', null);
  end loop;
end $$;

select * from _seed_results order by line;
