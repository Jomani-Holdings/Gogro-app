-- Remove duplicate garage rows created by the missing form-id bug.
-- Safe-guarded: only deletes the known bad IDs if nothing references them.
with bad_ids as (
  select id
  from public.garages
  where id in (
    '16488d7c-3ff1-4c54-8532-9f74ee7a041e',
    '5ec17165-23d7-49ef-b5c3-590f5af394e5',
    '7fae6d0c-df9a-4486-a9f9-2bea4a9563f7',
    'c93af9ee-6e50-47aa-89ed-75f7f06f091f'
  )
  and not exists (select 1 from public.profiles where fuel_garage_id = garages.id)
  and not exists (select 1 from public.transactions where garage_id = garages.id)
)
delete from public.garages
where id in (select id from bad_ids);