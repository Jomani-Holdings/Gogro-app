-- Phase: admin review audit trail for payment proofs.

alter table public.payment_proofs
  add column if not exists reviewed_at timestamptz,
  add column if not exists reviewed_by uuid references public.profiles(id) on delete set null,
  add column if not exists reviewer_notes text;

alter table public.payment_proofs
  drop constraint if exists payment_proofs_status_check;

alter table public.payment_proofs
  add constraint payment_proofs_status_check
    check (status in ('pending', 'approved', 'rejected', 'disputed'));
