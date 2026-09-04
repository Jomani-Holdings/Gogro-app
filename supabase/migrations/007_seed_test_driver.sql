-- Seed a test driver login and a pending application.
--
-- Login:    test@driver.com
-- Password: 12345678aA
--
-- Notes:
--   * The auth.users insert fires the `handle_new_user` trigger (see
--     004_dashboards_and_cms.sql), which auto-creates the public.profiles row.
--   * The auth schema in this project uses generated columns (`confirmed_at`,
--     `auth.identities.email`) and GoTrue scans the token columns into non-null
--     Go strings, so they MUST be set to '' (not NULL). `provider_id` is the
--     user's UUID, not the email address.
--   * The application is created with status 'pending' and points at the first
--     active fuel garage.

-- 1. Auth user (password hashed with bcrypt, email pre-confirmed).
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
  '11111111-1111-4111-8111-111111111111',
  'authenticated',
  'authenticated',
  'test@driver.com',
  extensions.crypt('12345678aA', extensions.gen_salt('bf', 10)),
  now(),
  '',
  '',
  '',
  '',
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"email_verified":true,"full_name":"Test Driver"}'::jsonb,
  now(),
  now()
)
on conflict (id) do nothing;

-- 2. Auth identity (email provider), so password login resolves correctly.
insert into auth.identities (
  provider_id,
  user_id,
  identity_data,
  provider,
  created_at,
  updated_at
) values (
  '11111111-1111-4111-8111-111111111111',
  '11111111-1111-4111-8111-111111111111',
  '{"sub":"11111111-1111-4111-8111-111111111111","email":"test@driver.com","email_verified":false,"phone_verified":false}'::jsonb,
  'email',
  now(),
  now()
)
on conflict (provider, provider_id) do nothing;

-- 3. Pending application linked to the user above.
insert into public.applications (
  user_id,
  full_name,
  contact_number,
  email,
  id_or_passport_number,
  physical_address,
  car_make_model_year,
  car_registration_number,
  ehailing_platform,
  driver_type,
  garage_id,
  weekly_credit_band,
  heard_about_us,
  reference_name,
  deposit_required,
  status
) values (
  '11111111-1111-4111-8111-111111111111',
  'Test Driver',
  '078 082 7940',
  'test@driver.com',
  '9001010000000',
  '123 Test Street, Cape Town',
  'Toyota Corolla 2021',
  'CA 123-456',
  'UBER',
  'Own Car',
  (select g.id
   from public.garages g
   join public.partner_types pt on g.partner_type_id = pt.id
   where pt.slug = 'fuel'
   order by g.sort_order
   limit 1),
  'R 1 001 - R 2 000',
  'Social Media',
  null,
  true,
  'pending'
)
on conflict (user_id) do nothing;
