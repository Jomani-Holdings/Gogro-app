# GoGro Tasks

## Completed
- [x] Hotfix: remove duplicate Request Documents button + nested button error
- [x] Hotfix: filter placeholder document rows in DocumentsManager
- [x] Hotfix: map fuel form fields to profile on approval
- [x] Hotfix: remove raw data block from submission detail
- [x] Hotfix: hardlock re-assigning already-approved forms
- [x] Hotfix: change Suspend button to set driver status inactive instead of suspended
- [x] Hotfix: remove "Suspended" from Activity Status dropdown
- [x] Sprint 1: upgrade Next.js to 16.4.0
- [x] Sprint 1: run npm audit fix
- [x] Sprint 1: track .env.example
- [x] Sprint 1: migration 030 security RLS lockdown
- [x] Sprint 2: migration 031 immutable transactions ledger
- [x] Sprint 2: admin driver categorical balances
- [x] Sprint 2: refactor repairs to use repair_balance
- [x] Sprint 2: fix geolocation Permissions-Policy

## Pending Review / Do Not Push Yet
- [ ] Review Sprint 1 commit (b42fe77) before pushing
- [ ] Review Sprint 2 commit (9644434) before pushing
- [ ] Apply migrations 030 & 031 to Supabase DB

## Deferred to v2
- [ ] Build Rentals admin area
- [ ] Rental vehicle assignment workflow
- [ ] Rental fee/repayment logging UI

## Production Sweep — Fuel Credit Launch

### P0 — Secrets & repo hygiene
- [x] Rotate all secrets from `.env.local` / `.env.production` and delete the files from disk; move production env vars to Vercel only
- [x] Move seed migrations (`007`, `038`, `040`) and `drivers_seed.csv` to `.ignored/seeded/`; add `.ignored/` to `.gitignore`; stop tracking seed files
- [x] Move `039_seed_updated_drivers.sql` to `.ignored/seeded/` (found during sweep; contained driver PII and plaintext passwords)
- [x] Update `scripts/generate-driver-seed.mjs` output path to `.ignored/seeded/`
- [x] Add `scripts/` to `.gitignore` to keep the entire scripts folder untracked

### P0 — Dependencies
- [x] Upgrade `next` to `^16.4.3`; `npm audit` reports 0 vulnerabilities
- [x] Update `zod` to `^4.6.7`, `csv-parse` to `^7.0.3`, `@vercel/functions` to `^3.10.4`, `@serwist/*` to `^9.5.13`; pin `happy-dom` to `^21.0.4` via overrides

### P0 — Database / RLS
- [x] Lock down `profiles_own_update` so drivers cannot edit financial/admin columns (migration `045`)
- [x] Lock down `redeem_driver_points` (revoke public, grant service_role) and add row locking for concurrent claims (migration `045`)
- [x] Fix soft-delete/restore reversal to keep categorical balances in sync (migration `047`)
- [x] Add unique partial index on `profiles.fuel_code`; rewrite `generateFuelCode` with CSPRNG + retry (migration `044`)
- [x] Enforce weekly fuel limit atomically in DB (migration `046`)
- [x] Add admin RLS policy on `payment_proofs` (migration `045`)
- [ ] Reconcile `opening_balance` rows with categorical balances
- [x] Add DB-backed `auth_attempts` table for login/password-reset rate limiting (migration `056`)

### P0 — Server actions / API
- [x] Add `requireAdmin()` to `setDriverActivation`
- [x] Prevent admin role downgrade in submission approval; validate inputs with zod
- [x] Add zod schemas for `logTransaction`, `createDriver`/`updateDriver`, `reviewPaymentProof`
- [x] Make payment-proof approval atomic (migration `048`)
- [x] Fix storage path traversal in `/api/media`, `/api/documents`, `/api/avatars`
- [x] Harden cron job: timing-safe comparison + idempotent conditional update
- [ ] Rotate `CRON_SECRET` to 32+ bytes in Vercel (current local value is 26 chars)
- [x] Add `import "server-only"` to `lib/data/admin.ts` and `lib/data/client.ts`
- [x] Sanitize `findMatchingProfileIds` filter; return generic client errors

### P1 — Infra / PWA / headers
- [x] Extend `proxy.ts` (Next.js 16 convention) with nonce-based CSP, session refresh, security headers; use DB-backed `auth_attempts` for login/password-reset rate limiting instead of in-memory state
- [x] Disable API response caching in service worker with `NetworkOnly` for `/api/*`
- [x] Restrict CSP Supabase hosts to the exact project domain; apply strict nonce CSP to `/dashboard/*` and `/api/*` (static routes retain `unsafe-inline` for Next.js inline flight scripts)
- [x] Set `Cache-Control: no-store` on authenticated avatar/document proxy responses; keep public gallery media cached and private reward media no-store
- [x] Route all 8 media upload flows through server-signed Supabase URLs and prepare/finalize actions; lower `serverActions.bodySizeLimit` to `2mb`

### P1 — Performance / Scale
- [x] Optimize notifications: initial server snapshot + Supabase Realtime inserts; removed 30s polling
- [x] Add missing DB indexes for hot queries (trigram search + `(created_at, id)` cursor indexes)
- [x] Paginate unbounded admin lists with cursor-based Previous/Next (drivers, vehicles, leads, submissions, transactions, payment proofs, repayments, repairs)
- [x] Move dashboard aggregations to SQL/RPC (materialized historical stats + live profile aggregates)
- [x] Keep payment-proof signed URLs inline for the 25-row page; lazy generation intentionally dropped
- [x] Parallelize client dashboard fetches and pass preloaded balances into `getClientRequiredActions`
- [x] Supabase Realtime notifications replaces 30s polling

### P1 — UI / UX
- [x] Fix `VehiclesTable` status crash fallback
- [x] Add `error.tsx` / `loading.tsx` to dashboard routes
- [x] Show signed amounts / direction labels in transaction tables
- [x] Include `reward_credit` in `getClientDebtBreakdown`
- [ ] Add accessible labels / modal ARIA improvements
- [x] Add `Suspense` fallback for `FuelUsageByGarage`; parallelize client fetches

### P2 — Correctness / Atomicity
- [x] Make critical server actions atomic (`logTransaction`, `updateSubmissionStatus`, `reviewPaymentProof`, `createDriver`, `awardReferralPoints`) via migration `054`
- [ ] Optimize `driver_account_summary` view by caching derived fields or materializing to avoid per-row function calls
- [x] Fix overdue-drivers cron to use a single `UPDATE ... WHERE` with an exact count instead of loading IDs into memory

### P2 — Adopt from fixxr-app
- [ ] Add upload validation pipeline: magic-byte file type checks, EXIF/GPS stripping, filename sanitization, size/type allowlists, safe path templates
- [ ] Harden storage/file proxy routes with bucket allowlist, ownership verification, no-store cache, no signed-URL leakage
- [ ] Add HMAC-signed tokens for sensitive links (e.g. form access tokens) with constant-time comparison + expiry
- [ ] Create `audit_logs` table and write audit events for admin actions, auth failures, balance mutations, payment-proof reviews
- [ ] Harden admin guard: DB-verified role, rate-limit failed attempts, force re-auth near expiry, audit unauthorized attempts
- [ ] Expand zod validation: disposable-email check, E.164 phone, strong password schema
- [ ] Add DB-level immutability triggers for `audit_logs` / `transaction_deletions` / critical ledger tables
- [ ] Add `DEPLOYMENT.md`: staging/prod env separation, release flow, rollback procedure, migration order, secret ownership matrix
- [ ] Add testing infrastructure: Jest + Playwright config, sample tests for auth, fuel issue, payment proof, file proxy
- [ ] Add GitHub Actions CI to run lint, typecheck, build, Jest, and Playwright on PRs
- [ ] Add Vercel Analytics / Speed Insights components if not already present
- [ ] Add `/media/*` rewrites to hide Supabase storage hostname and SEO redirects from DB
- [ ] Add Supabase migration lint step to CI (`supabase db lint`) and backup/DR runbook

### P2 — Verification
- [x] `npm audit` (0 vulnerabilities), `npm run build`, and `npm run lint` pass
- [x] UI/UX polish (`VehiclesTable` fallback, dashboard error/loading, signed amounts, reward credits, chart Suspense) passes typecheck, lint, and build
- [x] Migrations `044`–`056` applied to shared local/staging DB
- [x] Proxy CSP/security headers, API service-worker bypass, and auth rate limiting pass typecheck, lint, and build
- [x] CSP headers smoke-tested: static routes use config CSP; `/dashboard/*` and `/api/*` use nonce CSP; generated service worker routes `/api/*` through `NetworkOnly`
- [x] Signed-upload smoke-tested with the anon browser client for `gallery`, `documents`, `avatars`, and `rewards`, including the contract pending-to-final `move` flow; all test objects cleaned up
- [x] RLS profile financial-column lock and weekly fuel-limit trigger smoke-tested
- [x] Cursor filter, dashboard RPCs, and repair stats RPC smoke-tested against staging
- [x] Atomic admin RPCs smoke-tested against staging in a rolled-back transaction (log, limit trigger, penalty, driver+vehicle, submission approval, referral points, overdue update)
- [x] `pg_cron` refresh job `refresh-platform-stats` scheduled every 15 minutes
- [x] `notifications` added to `supabase_realtime` publication
- [ ] Admin guards tested on staging
- [ ] DB integrity tests (delete/restore)
- [ ] Path traversal blocked
- [ ] End-to-end fuel flow smoke test
- [ ] Paginated admin lists click-through smoke-tested in a logged-in session
- [ ] Notification realtime delivery smoke-tested in a logged-in session
