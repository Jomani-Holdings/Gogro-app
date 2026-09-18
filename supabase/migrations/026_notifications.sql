-- In-app notifications for the admin and client portals.

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  body text,
  link text,
  type text,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create index notifications_user_id_read_idx on public.notifications (user_id, read);
create index notifications_created_at_idx on public.notifications (created_at);

-- RLS: clients read their own notifications through the browser client;
-- admin reads use the service role and bypass RLS.
alter table public.notifications enable row level security;

create policy "notifications_own_read" on public.notifications
  for select using (auth.uid() = user_id);

create policy "notifications_own_update" on public.notifications
  for update using (auth.uid() = user_id);

create policy "notifications_own_insert" on public.notifications
  for insert with check (auth.uid() = user_id);