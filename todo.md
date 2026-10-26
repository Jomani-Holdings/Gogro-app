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
- [ ] Rotate all secrets from `.env.local` / `.env.production` and delete the files from disk; move production env vars to Vercel only
- [x] Move seed migrations (`007`, `038`, `040`) and `drivers_seed.csv` to `.ignored/seeded/`; add `.ignored/` to `.gitignore`; stop tracking seed files
- [x] Update `scripts/generate-driver-seed.mjs` output path to `.ignored/seeded/`
- [x] Add `scripts/` to `.gitignore` to keep the entire scripts folder untracked

### P0 — Dependencies
- [ ] Upgrade `next` to `>=16.4.3` and run `npm audit fix`
- [ ] Update `zod >=4.6.6`, `csv-parse >=7.0.2`, `@vercel/functions`; audit `@tiptap/html`/`happy-dom`

### P0 — Database / RLS
- [ ] Lock down `profiles_own_update` so drivers cannot edit financial/admin columns
- [ ] Lock down `redeem_driver_points` (revoke public, grant service_role) and add row locking for concurrent claims
- [ ] Fix soft-delete/restore reversal to keep categorical balances in sync
- [ ] Add unique partial index on `profiles.fuel_code`; rewrite `generateFuelCode` with CSPRNG + retry
- [ ] Enforce weekly fuel limit atomically in DB
- [ ] Add admin RLS policy on `payment_proofs`
- [ ] Reconcile `opening_balance` rows with categorical balances

### P0 — Server actions / API
- [ ] Add `requireAdmin()` to `setDriverActivation`
- [ ] Prevent admin role downgrade in submission approval; validate inputs with zod
- [ ] Add zod schemas for `logTransaction`, `createDriver`/`updateDriver`, `reviewPaymentProof`
- [ ] Make payment-proof approval atomic
- [ ] Fix storage path traversal in `/api/media`, `/api/documents`, `/api/avatars`
- [ ] Harden cron job (timing-safe comparison, idempotency, strong secret)
- [ ] Add `import "server-only"` to `lib/data/admin.ts` and `lib/data/client.ts`
- [ ] Sanitize `findMatchingProfileIds` filter; return generic client errors

### P1 — Infra / PWA / headers
- [ ] Extend `proxy.ts` (Next.js 16 convention) with in-memory rate limiting, IP progressive blocking, nonce-based CSP, session refresh, security headers
- [ ] Disable API response caching in service worker; set `Cache-Control: no-store` on authenticated API routes
- [ ] Tighten CSP in `next.config.ts` (remove unsafe-inline in prod, restrict Supabase hosts, add report-to)
- [ ] Lower `serverActions.bodySizeLimit`; route large uploads directly to Supabase Storage

### P1 — Performance / Scale
- [ ] Optimize notifications: add composite index `(user_id, created_at desc)`, split unread count query, pass initial data from server layout, reduce polling overhead
- [ ] Add missing DB indexes for hot queries (`profiles.role`, `driver_status`, `fuel_balance`, `email`, `fuel_code`; `payment_proofs`; `transactions`; `leads`; `vehicles`; `notifications`)
- [ ] Paginate unbounded admin lists (drivers, vehicles, leads, submissions, applications, transactions, repair drivers)
- [ ] Move dashboard aggregations to SQL/RPC (dashboard stats, active drivers, top debtors, fuel usage by garage)
- [ ] Replace per-row signed URL generation in `getAdminPaymentProofs` with lazy generation
- [ ] Parallelize sequential dashboard data fetches and remove duplicate `getClientBalances` call
- [ ] Consider Supabase Realtime for notifications to eliminate 30s polling

### P1 — UI / UX
- [ ] Fix `VehiclesTable` status crash fallback
- [ ] Add `error.tsx` / `loading.tsx` to dashboard routes
- [ ] Show signed amounts / direction labels in transaction tables
- [ ] Include `reward_credit` in `getClientDebtBreakdown`
- [ ] Add accessible labels / modal ARIA improvements
- [ ] Add `Suspense` fallback for `FuelUsageByGarage`; parallelize client fetches

### P2 — Correctness / Atomicity
- [ ] Make critical server actions atomic (`logTransaction`, `updateSubmissionStatus`, `reviewPaymentProof`, `createDriver`, `awardReferralPoints`)
- [ ] Optimize `driver_account_summary` view by caching derived fields or materializing to avoid per-row function calls
- [ ] Fix overdue-drivers cron to use `WHERE` clause instead of loading all IDs into memory

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
- [ ] `npm audit`, build, typecheck pass
- [ ] RLS / admin guards tested
- [ ] DB integrity tests (weekly limit, delete/restore)
- [ ] Path traversal blocked
- [ ] End-to-end fuel flow smoke test
- [ ] Notification query plan/index verified
- [ ] Paginated admin lists smoke-tested
