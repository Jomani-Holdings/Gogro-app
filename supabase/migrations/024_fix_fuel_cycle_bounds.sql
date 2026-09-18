-- Correct fuel cycle helper timezone handling.
-- Previous version used ::date which shifted the wall-clock time. The new
-- version works entirely on timestamps at 'Africa/Johannesburg'.
create or replace function public.fuel_cycle_bounds(as_of timestamptz)
returns table (cycle_start timestamptz, cycle_end timestamptz)
language sql
stable
as $$
  select
    (date_trunc('week', as_of at time zone 'Africa/Johannesburg') + interval '1 day') at time zone 'Africa/Johannesburg' as cycle_start,
    (date_trunc('week', as_of at time zone 'Africa/Johannesburg') + interval '7 days') at time zone 'Africa/Johannesburg' as cycle_end;
$$;