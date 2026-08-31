create table public.applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  full_name text,
  contact_number text,
  email text,
  id_or_passport_number text,
  physical_address text,
  car_make_model_year text,
  car_registration_number text,
  ehailing_platform text,
  ehailing_platform_other text,
  driver_type text,
  garage_id uuid references public.garages(id),
  weekly_credit_band text,
  heard_about_us text,
  reference_name text,
  deposit_required boolean,
  sync_status jsonb default '{}'::jsonb,
  status text not null default 'incomplete'
);

create unique index applications_user_id_key on public.applications (user_id);
