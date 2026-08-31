-- Seed Western Cape partner garages with mock contact + location data.
insert into public.garages (name, type, address, phone, latitude, longitude, sort_order) values
  ('Kraaifontein Astron', 'fuel', '1 Brighton Road, Kraaifontein, Cape Town, 7570', '021 555 0101', -33.8480, 18.7176, 1),
  ('Goodwood Astron', 'fuel', '42 Voortrekker Road, Goodwood, Cape Town, 7460', '021 555 0102', -33.9106, 18.5532, 2),
  ('Paarl BP', 'fuel', '18 Main Road, Paarl, 7646', '021 555 0103', -33.7342, 18.9621, 3),
  ('Atlantis Astron', 'fuel', '7 Silvermine Street, Atlantis, Cape Town, 7349', '021 555 0104', -33.5669, 18.4831, 4),
  ('Grassy Park Astron', 'fuel', '3 Klip Road, Grassy Park, Cape Town, 7941', '021 555 0105', -34.0486, 18.4948, 5),
  ('Blue Downs Astron', 'fuel', '22 Hindle Road, Blue Downs, Cape Town, 7100', '021 555 0106', -34.0112, 18.7005, 6),
  ('Strand Astron', 'fuel', '11 Beach Road, Strand, Cape Town, 7140', '021 555 0107', -34.1166, 18.8272, 7),
  ('Mowbray Astron', 'fuel', '15 Main Road, Mowbray, Cape Town, 7700', '021 555 0108', -33.9470, 18.4760, 8),
  ('Cape Town Service Centre', 'service', '4 Buitenkant Street, Cape Town, 8001', '021 555 0201', -33.9258, 18.4232, 9),
  ('Northern Suburbs Auto Repairs', 'service', '9 Durban Road, Bellville, Cape Town, 7530', '021 555 0202', -33.8960, 18.6422, 10);

-- RLS: garages are publicly readable.
alter table public.garages enable row level security;
create policy "garages_public_read" on public.garages for select using (true);

-- RLS: drivers can read their own application.
alter table public.applications enable row level security;
create policy "applications_own_read" on public.applications
  for select using (auth.uid() = user_id);
