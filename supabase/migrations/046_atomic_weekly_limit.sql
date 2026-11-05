-- Atomic weekly fuel-limit enforcement.
--
-- The server action still shows the friendly over-limit warning, but this
-- trigger is the final guard. It locks the driver's profile row so two
-- concurrent fuel issues cannot both read the same pre-insert total and slip
-- over the limit.
--
-- `overlimit_acknowledged` records that an admin explicitly chose either
-- "authorize" or "unauthorized" for this purchase. `authorized_overlimit`
-- remains the reporting flag (true only for an authorized override).

alter table public.transactions
  add column if not exists overlimit_acknowledged boolean not null default false;

create or replace function public.enforce_weekly_fuel_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_limit numeric;
  v_issued numeric;
begin
  if new.type <> 'fuel_issue' or new.overlimit_acknowledged then
    return new;
  end if;

  -- Serialize concurrent fuel issues for the same driver.
  select weekly_fuel_limit
    into v_limit
  from public.profiles
  where id = new.driver_id
  for update;

  if not found then
    raise exception 'Driver not found.' using errcode = '23503';
  end if;

  v_issued := public.driver_weekly_fuel_issued(new.driver_id, new.created_at);

  if v_issued + new.amount > coalesce(v_limit, 2000) then
    raise exception 'Weekly fuel limit exceeded.' using errcode = '23514';
  end if;

  return new;
end;
$$;

drop trigger if exists transactions_enforce_weekly_fuel_limit on public.transactions;
create trigger transactions_enforce_weekly_fuel_limit
  before insert on public.transactions
  for each row
  execute function public.enforce_weekly_fuel_limit();
