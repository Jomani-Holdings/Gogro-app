-- Treat `transactions` as an append-only accounting ledger.
--
-- The balance trigger (`update_profile_balance_on_transaction`) runs AFTER
-- INSERT only, so any UPDATE or DELETE would silently desynchronise
-- `profiles.driver_balance` and the categorical balances from the ledger.
-- Mistakes must be corrected by logging a reversing transaction instead.

create or replace function public.forbid_transactions_mutation()
returns trigger
language plpgsql
as $$
begin
  raise exception 'transactions are immutable; log a reversing transaction instead';
end;
$$;

drop trigger if exists transactions_forbid_update on public.transactions;
create trigger transactions_forbid_update
  before update on public.transactions
  for each row
  execute function public.forbid_transactions_mutation();

drop trigger if exists transactions_forbid_delete on public.transactions;
create trigger transactions_forbid_delete
  before delete on public.transactions
  for each row
  execute function public.forbid_transactions_mutation();
