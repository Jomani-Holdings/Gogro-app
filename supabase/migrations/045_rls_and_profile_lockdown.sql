-- Lock down self-service profile updates and privileged RPCs.
--
-- Drivers may only change their own full_name, phone and avatar_url through
-- the public client. Every financial, role, status and reward field is
-- hard-locked at the database level, regardless of what the UI sends.

-- 1. Replace the broad self-update policy with an explicit own-row policy.
drop policy if exists "profiles_own_update" on public.profiles;
create policy "profiles_own_update"
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 2. Column-level guard. Comparing JSONB minus the allowed columns means new
--    profile columns are automatically locked unless explicitly whitelisted.
create or replace function public.enforce_profile_self_update_columns()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_is_admin boolean;
begin
  -- Service-role and other trusted server-side callers have no auth.uid().
  if auth.uid() is null then
    return new;
  end if;

  select exists (
    select 1
    from public.profiles p
    where p.user_id = auth.uid()
      and p.role = 'admin'
  ) into v_is_admin;

  if v_is_admin then
    return new;
  end if;

  if (to_jsonb(new) - 'full_name' - 'phone' - 'avatar_url' - 'updated_at')
     is distinct from
     (to_jsonb(old) - 'full_name' - 'phone' - 'avatar_url' - 'updated_at')
  then
    raise exception 'This profile field cannot be updated by the account owner.'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

drop trigger if exists profiles_enforce_self_update_columns on public.profiles;
create trigger profiles_enforce_self_update_columns
  before update on public.profiles
  for each row
  execute function public.enforce_profile_self_update_columns();

-- 3. Admins need to list and review every payment proof, not just their own.
drop policy if exists "payment_proofs_admin_all" on public.payment_proofs;
create policy "payment_proofs_admin_all"
  on public.payment_proofs
  for all
  to authenticated
  using (
    exists (
      select 1
      from public.profiles p
      where p.user_id = auth.uid()
        and p.role = 'admin'
    )
  )
  with check (
    exists (
      select 1
      from public.profiles p
      where p.user_id = auth.uid()
        and p.role = 'admin'
    )
  );

-- 4. Points redemption is server-only. Clients use the server action, which
--    calls this RPC through the service role.
revoke all on function public.redeem_driver_points(uuid, uuid) from public;
revoke all on function public.redeem_driver_points(uuid, uuid) from anon, authenticated;
grant execute on function public.redeem_driver_points(uuid, uuid) to service_role;
