-- Follow-up indexes for dashboard debt ranking and repayment history cursors.

create index if not exists profiles_role_driver_balance_idx
  on public.profiles (role, driver_balance desc);

create index if not exists transactions_type_created_id_desc_idx
  on public.transactions (type, created_at desc, id desc);
