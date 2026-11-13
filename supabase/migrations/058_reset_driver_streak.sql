-- Reset a driver's on-time streak atomically and advance their streak cycle.
--
-- Advancing `streak_cycle` lets the same 5/10/15/20-week milestones be earned
-- again on the driver's next streak, while the old redemption rows remain as
-- an audit trail (see migration 057).

create or replace function public.reset_driver_streak(p_driver_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_cycle integer;
begin
  if p_driver_id is null then
    return jsonb_build_object('ok', false, 'error', 'Driver is required.');
  end if;

  update public.profiles
  set current_streak = 0,
      streak_cycle = coalesce(streak_cycle, 0) + 1,
      updated_at = now()
  where id = p_driver_id
  returning streak_cycle into v_cycle;

  if not found then
    return jsonb_build_object('ok', false, 'error', 'Driver not found.');
  end if;

  return jsonb_build_object('ok', true, 'streak_cycle', v_cycle);
end;
$$;

revoke all on function public.reset_driver_streak(uuid) from public;
revoke all on function public.reset_driver_streak(uuid) from anon, authenticated;
grant execute on function public.reset_driver_streak(uuid) to service_role;
