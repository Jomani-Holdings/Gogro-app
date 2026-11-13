-- Remove the legacy 10-argument log_transaction overload.
--
-- Migration 057 added an 11-argument version that stores service_fee. The
-- application now always calls the 11-argument version, so the old overload is
-- removed to avoid ambiguous RPC resolution in PostgREST.

drop function if exists public.log_transaction(
  uuid, text, numeric, numeric, uuid, uuid, timestamptz, text, integer, boolean
);
