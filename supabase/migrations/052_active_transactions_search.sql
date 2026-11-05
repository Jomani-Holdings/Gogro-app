-- Dedicated admin transaction search view. Exposes flattened driver fields so
-- the admin ledger can search by name/email/phone with a single PostgREST OR
-- filter (instead of building a large `IN (profile ids)` parameter).

create or replace view public.admin_transactions_search
with (security_invoker = true) as
select
  t.id,
  t.driver_id,
  t.vehicle_id,
  t.garage_id,
  t.type,
  t.amount,
  t.litres,
  t.points_earned,
  t.created_at,
  v.make_model as vehicle_name,
  g.name as garage_name,
  p.full_name as driver_name,
  p.email as driver_email,
  p.phone as driver_phone
from public.transactions t
left join public.vehicles v on v.id = t.vehicle_id
left join public.garages g on g.id = t.garage_id
left join public.profiles p on p.id = t.driver_id
where t.reverses_transaction_id is null
  and t.restores_transaction_id is null
  and not exists (
    select 1
    from public.transaction_deletions d
    where d.transaction_id = t.id
      and d.restored_at is null
  );

grant select on public.admin_transactions_search to authenticated, service_role;
