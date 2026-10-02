-- Profile avatars: store a storage path on profiles and host the files in a
-- private avatars bucket. Files are served through the app's avatar API route,
-- which enforces owner/admin access.

alter table public.profiles
  add column if not exists avatar_url text;

-- Private storage bucket for profile photos. Not publicly readable.
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', false)
on conflict (id) do update set public = false;

-- Avatars are keyed by avatars/<user_id>/<filename>. Authenticated users may
-- read their own avatar (and admins may read any avatar).
drop policy if exists "avatars_own_read" on storage.objects;
create policy "avatars_own_read"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'avatars'
  and (
    (storage.foldername(name))[1] = auth.uid()::text
    or exists (
      select 1 from public.profiles p
      where p.user_id = auth.uid() and p.role = 'admin'
    )
  )
);

-- Allow authenticated users to upload avatars for themselves.
drop policy if exists "avatars_own_insert" on storage.objects;
create policy "avatars_own_insert"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to update or delete their own avatars.
drop policy if exists "avatars_own_update" on storage.objects;
create policy "avatars_own_update"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "avatars_own_delete" on storage.objects;
create policy "avatars_own_delete"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);