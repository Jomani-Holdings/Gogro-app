-- Show the just-completed fuel cycle on Mondays.
--
-- The cycle definition is intentionally unchanged: Tue 00:00 -> following
-- Mon 00:00 SAST (exclusive), and the next cycle still begins Tuesday 00:00.
-- This keeps the existing Monday settlement window intact:
--   * fuel reminder appears from Monday 14:00 SAST (getCurrentSastMonday2PM),
--   * the overdue-driver deactivation cron runs on Monday.
--
-- Bug: on Mondays the week anchor (date_trunc('week') -> Monday) landed on the
-- current Monday, so cycle_start jumped to the *next* Tuesday and every
-- transaction fell "out of cycle". The client dashboard's Weekly Account
-- Summary and Available Credit therefore read R0 all day Monday - even after
-- transactions were logged - while My Finances (which is not cycle-filtered)
-- updated normally.
--
-- Fix: shift the week anchor back one day so a Monday maps to the cycle that
-- has just completed (previous Tue -> this Mon 00:00). Tuesday through Sunday
-- behaviour is byte-for-byte identical to the previous implementation.
create or replace function public.fuel_cycle_bounds(as_of timestamptz)
returns table (cycle_start timestamptz, cycle_end timestamptz)
language sql
stable
as $$
  select
    (date_trunc('week', (as_of - interval '1 day') at time zone 'Africa/Johannesburg') + interval '1 day') at time zone 'Africa/Johannesburg' as cycle_start,
    (date_trunc('week', (as_of - interval '1 day') at time zone 'Africa/Johannesburg') + interval '7 days') at time zone 'Africa/Johannesburg' as cycle_end;
$$;
