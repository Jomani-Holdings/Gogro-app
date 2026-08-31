create table public.garages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null default 'fuel',
  address text,
  phone text,
  latitude double precision,
  longitude double precision,
  active boolean not null default true,
  sort_order int not null default 0
);
