-- Phase 8 (cont.): Backfill opening balances into the ledger.
--
-- Every existing driver with a fuel_balance > 0 gets a single opening_balance
-- transaction so ledger totals reconcile with the stored profile balance.
-- opening_balance does not change balances (the trigger ignores it).

insert into public.transactions (driver_id, type, amount, created_at)
select id, 'opening_balance', fuel_balance, now()
from public.profiles
where fuel_balance > 0;