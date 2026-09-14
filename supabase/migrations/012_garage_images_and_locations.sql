-- Phase 5: Partner/garage images + corrected partner location list.
--
-- Non-destructive merge strategy:
--   * Add image_path and description columns to public.garages.
--   * Update existing garages that match by (partner_type, name).
--   * Insert net-new garages.
--   * Deactivate old active fuel/service garages that are not in the list
--     (foreign keys in applications.garage_id / profiles.fuel_garage_id are
--     preserved, and inactive garages are hidden from the public site).
--   * Re-link the test driver application to the new first fuel garage.
--   * Ensure the `gallery` storage bucket exists and is publicly readable.

-- 1. New columns.
alter table public.garages add column if not exists image_path text;
alter table public.garages add column if not exists description text;

-- 2. New partner location list.
create temp table new_garages (
  partner_type_slug text not null,
  name text not null,
  address text,
  description text,
  sort_order int not null
) on commit drop;

insert into new_garages (partner_type_slug, name, address, description, sort_order) values
  ('fuel', 'Astron Energy Marlborough Street', '22 Marlborough Street, Kraaifontein 7579', null, 1),
  ('fuel', 'Astron Energy Goodwood', '31 Voortrekker Road, Goodwood, 7460', null, 2),
  ('fuel', 'BP Paarl', 'Cnr Jan Van Riebeeck Drive & Huguenot', null, 3),
  ('fuel', 'Astron Energy Klip Road', '38 Klip Road, Grassy Park', null, 4),
  ('fuel', 'Astron Energy Blue Down Way', '1 Blue Downs Way, Blue Downs, Cape Town 8530', null, 5),
  ('fuel', 'Astron Energy Greenways', '82 Gordon''s Bay Drive, Strand', null, 6),
  ('fuel', 'Astron Energy Mowbray', '80 Durban Road, Mowbray, 7700', null, 7),
  ('service', 'CL Automotive Services', '172 Wapnick Street, Peerless Park West, Cape Town, 7570', E'General Maintenance and Repairs\nPanel Beating\nTowing\nRMI and MIWA ACCREDITED', 8),
  ('service', 'Fixxr', 'Address available on request', null, 9),
  ('service', 'Autoworx Performance', '30 Balfour Road, Windsor Park, Cape Town, 7570', null, 10),
  ('service', 'Best drive Brackenfell', '3 Jeanette Street, Brackenfell South, Cape Town 7560', null, 11);

-- 3. Update existing garages that match by (partner_type, name).
update public.garages g
set
  address = coalesce(ng.address, g.address),
  description = coalesce(ng.description, g.description),
  sort_order = ng.sort_order,
  active = true
from new_garages ng
join public.partner_types pt on pt.slug = ng.partner_type_slug
where pt.id = g.partner_type_id
  and g.name = ng.name;

-- 4. Insert net-new garages.
insert into public.garages (name, address, phone, latitude, longitude, active, sort_order, partner_type_id, description)
select
  ng.name,
  ng.address,
  null,
  null,
  null,
  true,
  ng.sort_order,
  pt.id,
  ng.description
from new_garages ng
join public.partner_types pt on pt.slug = ng.partner_type_slug
where not exists (
  select 1
  from public.garages g
  where g.partner_type_id = pt.id
    and g.name = ng.name
);

-- 5. Deactivate old active fuel/service garages that are not in the new list.
update public.garages g
set active = false
where g.active = true
  and exists (
    select 1
    from public.partner_types pt
    where pt.id = g.partner_type_id
      and pt.slug in ('fuel', 'service')
  )
  and not exists (
    select 1
    from new_garages ng
    join public.partner_types pt on pt.slug = ng.partner_type_slug
    where pt.id = g.partner_type_id
      and g.name = ng.name
  );

-- 6. Re-link the test driver application to the new first fuel garage.
do $$
begin
  if exists (
    select 1
    from information_schema.tables
    where table_schema = 'public'
      and table_name = 'applications'
  ) then
    update public.applications a
    set garage_id = (
      select g.id
      from public.garages g
      join public.partner_types pt on g.partner_type_id = pt.id
      where pt.slug = 'fuel'
        and g.name = 'Astron Energy Marlborough Street'
      limit 1
    )
    where a.user_id = '11111111-1111-4111-8111-111111111111';
  end if;
end $$;

-- 7. Ensure the gallery storage bucket exists and is publicly readable.
insert into storage.buckets (id, name, public)
values ('gallery', 'gallery', true)
on conflict (id) do update set public = true;

drop policy if exists "gallery_public_read" on storage.objects;
create policy "gallery_public_read"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'gallery');