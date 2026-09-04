-- Phase 1: dashboards + CMS data models.

-- Profiles extend auth.users with role + admin-managed fields.
create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'driver',
  full_name text,
  email text,
  phone text,
  suspended boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index profiles_user_id_key on public.profiles (user_id);

-- Auto-create a profile whenever a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (user_id, full_name, email)
  values (new.id, new.raw_user_meta_data ->> 'full_name', new.email)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- CMS: pages (SEO + hero metadata only).
create table public.pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  meta_title text,
  meta_description text,
  hero_title text,
  hero_subtitle text,
  status text not null default 'published',
  updated_at timestamptz not null default now()
);

-- CMS: services.
create table public.services (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  icon_name text,
  features jsonb not null default '[]'::jsonb,
  detail_content jsonb,
  sort_order int not null default 0,
  status text not null default 'published',
  updated_at timestamptz not null default now()
);

-- CMS: partner types (categories).
create table public.partner_types (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  icon_name text,
  sort_order int not null default 0
);

-- Migrate garages.type (text) -> garages.partner_type_id (fk).
insert into public.partner_types (slug, name, description, icon_name, sort_order) values
  ('fuel', 'Fuel Partners', 'Garages where you can access fuel credit.', 'fuel', 1),
  ('service', 'Service Partners', 'Garages offering vehicle maintenance and repairs.', 'wrench', 2);

alter table public.garages add column partner_type_id uuid references public.partner_types(id);

update public.garages
set partner_type_id = (select id from public.partner_types where slug = public.garages.type);

alter table public.garages alter column partner_type_id set not null;
alter table public.garages drop column type;

-- Seed the four current services so the public site keeps working.
insert into public.services (slug, name, description, icon_name, features, sort_order) values
  ('fuel-credit', 'Fuel Credit', 'Buy fuel on credit at our partner garages. Pay weekly and keep your vehicle on the road.', 'fuel', '["Weekly payment cycles","No upfront fuel costs","Trusted partner garages"]'::jsonb, 1),
  ('vehicle-rental', 'Vehicle Rental', 'Affordable rentals for eHailing, business or personal use — road-ready when you are.', 'car', '["Flexible rental terms","Road-ready vehicles","Support when you need it"]'::jsonb, 2),
  ('vehicle-management', 'Vehicle Management', 'We handle licences, paperwork, insurance and more. You focus on earning.', 'users', '["Licence & paperwork","Insurance assistance","Admin off your plate"]'::jsonb, 3),
  ('vehicle-repairs', 'Vehicle Repairs', 'Request a repair and we''ll connect you with trusted mechanics to keep you moving.', 'wrench', '["Trusted mechanics","Minimise downtime","Quality-assured work"]'::jsonb, 4);

-- Seed default page metadata.
insert into public.pages (slug, meta_title, meta_description, hero_title, hero_subtitle) values
  ('home', 'Go Gro Mobility | Mobility Solutions That Move You Forward', 'Fuel credit, vehicle rentals, management and repairs. All in one platform. Built for drivers.', 'Mobility Solutions That Move You Forward.', 'Fuel credit, vehicle rentals, management and repairs. All in one platform. Built for drivers.'),
  ('about', 'About Us | Go Gro Mobility', null, 'About Us', null),
  ('services', 'Our Services | Go Gro Mobility', null, 'Our Services', 'Everything you need to keep your vehicle on the road and your business growing — all in one platform.'),
  ('partners', 'Partners | Go Gro Mobility', null, 'Partners', 'Our network of partner garages keeps drivers moving across Cape Town.'),
  ('contact', 'Contact Us | Go Gro Mobility', null, 'Contact Us', 'Have a question or ready to get started? Our team is here to help.'),
  ('how-it-works', 'How It Works | Go Gro Mobility', null, 'How It Works', null),
  ('rewards', 'Driver Rewards | Go Gro Mobility', null, 'Driver Rewards', null);

-- RLS.
alter table public.profiles enable row level security;
create policy "profiles_own_read" on public.profiles for select using (auth.uid() = user_id);
create policy "profiles_own_update" on public.profiles for update using (auth.uid() = user_id);

alter table public.pages enable row level security;
create policy "pages_public_read" on public.pages for select using (status = 'published');

alter table public.services enable row level security;
create policy "services_public_read" on public.services for select using (status = 'published');

alter table public.partner_types enable row level security;
create policy "partner_types_public_read" on public.partner_types for select using (true);
