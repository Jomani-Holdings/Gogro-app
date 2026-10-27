-- P1 realtime notifications.
--
-- Realtime applies the existing notifications_own_read RLS policy
-- (auth.uid() = user_id) before broadcasting, so other users' rows never reach
-- the client. The browser still filters by user_id as a defense-in-depth check.

do $$
begin
  if exists (
    select 1
    from pg_publication
    where pubname = 'supabase_realtime'
  ) and not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'notifications'
  ) then
    execute 'alter publication supabase_realtime add table public.notifications';
  end if;
end;
$$;
