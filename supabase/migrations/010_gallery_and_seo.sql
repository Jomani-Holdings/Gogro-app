-- Phase 4: Public gallery + route-level SEO metadata.

-- 1. Gallery images. `storage_path` is the path inside the `gallery` storage
--    bucket (uuid + slugified filename). Public site reads active rows only.
create table public.galleries (
  id uuid primary key default gen_random_uuid(),
  storage_path text not null unique,
  filename text not null,
  caption text,
  alt_text text,
  description text,
  sort_order int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index galleries_active_sort_idx on public.galleries (active, sort_order);

-- 2. Route-level SEO metadata. One row per public route so static pages and
--    dynamic pages (e.g. /services/:slug) can be ranked individually.
create table public.seo_meta (
  id uuid primary key default gen_random_uuid(),
  route_path text not null unique,
  page_title text,
  meta_title text,
  meta_description text,
  og_title text,
  og_description text,
  og_image_url text,
  canonical_path text,
  noindex boolean not null default false,
  updated_at timestamptz not null default now()
);

create index seo_meta_route_idx on public.seo_meta (route_path);

-- 3. RLS. Public reads only; admin writes use the service role and bypass RLS.
alter table public.galleries enable row level security;
create policy "galleries_public_read" on public.galleries
  for select using (active = true);

alter table public.seo_meta enable row level security;
create policy "seo_meta_public_read" on public.seo_meta
  for select using (true);

-- 4. Seed SEO rows for the static marketing routes.
insert into public.seo_meta (route_path, page_title, meta_title, meta_description) values
  ('/', 'Go Gro Mobility', 'Go Gro Mobility | Mobility Solutions That Move You Forward', 'Fuel credit, vehicle rentals, management and repairs. All in one platform. Built for drivers.'),
  ('/about', 'About Us | Go Gro Mobility', 'About Us | Go Gro Mobility', 'Learn about Go Gro Mobility — a South African mobility company helping drivers and entrepreneurs move, operate and grow.'),
  ('/services', 'Our Services | Go Gro Mobility', 'Our Services | Go Gro Mobility', 'Explore fuel credit, vehicle rentals, vehicle management and repairs from Go Gro Mobility.'),
  ('/gallery', 'Gallery | Go Gro Mobility', 'Gallery | Go Gro Mobility', 'See Go Gro Mobility in action — fuel partners, vehicles, drivers and events.'),
  ('/contact', 'Contact Us | Go Gro Mobility', 'Contact Us | Go Gro Mobility', 'Get in touch with Go Gro Mobility. We are here to help drivers and mobility entrepreneurs grow.'),
  ('/how-it-works', 'How It Works | Go Gro Mobility', 'How It Works | Go Gro Mobility', 'Learn how Go Gro Mobility fuel credit, rentals and driver support work.'),
  ('/rewards', 'Driver Rewards | Go Gro Mobility', 'Driver Rewards | Go Gro Mobility', 'Discover Go Gro driver rewards and benefits.'),
  ('/partners', 'Partners | Go Gro Mobility', 'Partners | Go Gro Mobility', 'Our network of partner garages and mobility service providers.'),
  ('/apply', 'Apply Now | Go Gro Mobility', 'Apply Now | Go Gro Mobility', 'Apply to join Go Gro Mobility and access fuel credit, vehicle rentals and more.')
on conflict (route_path) do nothing;