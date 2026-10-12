-- Full 7-day fuel cycle: Tue 00:00 -> next Tue 00:00 (SAST).
--
-- Migration 034 fixed Mondays by showing the just-completed cycle, but the
-- cycle itself was still only 6 days (Tue 00:00 -> Mon 00:00, exclusive).
-- Any fuel issued on Monday therefore belonged to no cycle, so the client
-- dashboard's Weekly Account Summary stayed at R0 while My Finances (which is
-- not cycle-filtered) showed the transaction.
--
-- This migration makes the window a full 7 days (Tue 00:00 -> next Tue 00:00),
-- so Monday transactions are counted in the current week. The Tuesday anchor
-- and the existing Monday settlement logic (fuel reminder from Monday 14:00
-- via getCurrentSastMonday2PM, and the Monday overdue-driver cron) are
-- unchanged - the new cycle still begins Tuesday 00:00.
create or replace function public.fuel_cycle_bounds(as_of timestamptz)
returns table (cycle_start timestamptz, cycle_end timestamptz)
language sql
stable
as $$
  select
    (date_trunc('week', (as_of - interval '1 day') at time zone 'Africa/Johannesburg') + interval '1 day') at time zone 'Africa/Johannesburg' as cycle_start,
    (date_trunc('week', (as_of - interval '1 day') at time zone 'Africa/Johannesburg') + interval '8 days') at time zone 'Africa/Johannesburg' as cycle_end;
$$;

-- cycle_end is now Tuesday 00:00, so payment is due on Tuesday itself. Drop the
-- extra "+ 1 day" that previously landed the due date on the day after a Monday
-- cycle_end; otherwise every due date would shift to Wednesday.
create or replace function public.driver_next_payment_due(p public.profiles)
returns timestamptz
language sql
stable
as $$
  select case
    when p.payment_arrangement_due_date is not null then
      (p.payment_arrangement_due_date + p.payment_due_time) at time zone 'Africa/Johannesburg'
    else
      (select c.cycle_end from public.fuel_cycle_bounds(now()) c)
        + p.payment_due_time::interval
  end;
$$;
