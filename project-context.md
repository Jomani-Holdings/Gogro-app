# SYSTEM INSTRUCTIONS: Go Gro Mobility Website Build

You are an expert full-stack developer building the public marketing website for Go Gro Mobility, a South African mobility company based in Cape Town. 

## 1. PROJECT OVERVIEW & CONSTRAINTS
- **Goal:** Build a robust, responsive, accessible marketing site with a multi-step application form.
- **Tech Stack:** Next.js (App Router), TypeScript, Tailwind CSS, Supabase (Postgres), Resend.
- **Form Handling:** `react-hook-form` + `@hookform/resolvers/zod` + `zod`.
- **Database:** Supabase is the SINGLE source of truth. DO NOT implement Google Sheets syncing.
- **Styling:** Use standard Tailwind utility classes extended with our custom brand colors. Do not use arbitrary hex values (e.g., `text-[#0C0275]`).
- **Server Actions:** All form submissions must use Next.js Server Actions. Background tasks (like emails) must be wrapped in `@vercel/functions` `waitUntil()` to prevent serverless timeouts.

## 2. BRAND DESIGN SYSTEM (tailwind.config.ts)
Extend the Tailwind theme with these exact tokens:
- `navy`: DEFAULT: '#0C0275', dark: '#08015C' (Dominant brand color)
- `orange`: DEFAULT: '#FB6D00' (Primary action color)
- `yellow`: DEFAULT: '#FBB000' (Secondary accent/highlights only)
- `grey`: DEFAULT: '#D0D0D0'
- `offwhite`: '#F7F7FA'
- `textdark`: '#14122E'
- `success`: '#1E8E5A'
- `error`: '#D93025'

**Typography:**
- Headings: `Poppins` (Weights 600, 700) via `next/font/google`.
- Body: `Inter` (Weights 400, 500) via `next/font/google`.

## 3. CORE ARCHITECTURE & ROUTING
- `/` - Home (Requires a looping background video in the hero section)
- `/about` - About Us
- `/how-it-works` - How It Works (Fetch active garages from Supabase)
- `/services/fuel-credit` - Fuel Credit
- `/services/vehicle-rental` - Placeholder
- `/services/vehicle-management` - Placeholder
- `/services/vehicle-repairs` - Placeholder
- `/rewards` - Placeholder
- `/apply` - The Multi-step Application Form (Steps: Personal Info -> Fuel Usage -> References)
- `/contact` - Contact Us

## 4. DATABASE SCHEMA (Supabase Postgres)
All DB interactions must use the `@supabase/ssr` or `@supabase/supabase-js` clients. Write operations in Server Actions must use the `SUPABASE_SERVICE_ROLE_KEY` to bypass RLS.

```sql
create table garages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  active boolean not null default true,
  sort_order int not null default 0
);

create table applications (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  full_name text,                    
  contact_number text,
  email text,                        
  id_or_passport_number text,
  physical_address text,
  car_make_model_year text,
  car_registration_number text,
  ehailing_platform text,
  ehailing_platform_other text,
  driver_type text,                  
  garage_id uuid references garages(id),
  weekly_credit_band text,           
  heard_about_us text,
  reference_name text,
  deposit_required boolean,
  sync_status jsonb default '{}'::jsonb,  
  status text not null default 'incomplete' 
);


Go Gro Mobility
About Us &amp; 4-Month Operational Plan (September – December 2026)
Welcome to Go Gro Mobility
Welcome to the Go Gro team!
Go Gro Mobility is a South African mobility company focused on helping eHailing drivers build
sustainable businesses. We believe drivers need more than just access to fuel—they need a
trusted partner that helps them succeed.
Today, our services include:
 Fuel Credit
 Vehicle Rentals
 Driver Rewards Programme
 Vehicle Maintenance &amp; Repair Assistance
 Mobility Business Support
Everything we build is designed to reduce financial pressure on drivers while helping them keep
their vehicles on the road and earning income.
Our long-term vision is to become the leading mobility platform for independent drivers across
South Africa.

Our Mission
To make mobility more affordable, accessible and sustainable by providing practical financial
and vehicle solutions that help drivers grow their businesses.

Our Vision
To build South Africa&#39;s most trusted mobility ecosystem—where drivers can access every service
they need through one platform.

Our Values
Drivers First
Every decision we make should improve the lives of our drivers.
Trust
We build long-term relationships through honesty, transparency and consistency.
Innovation
We continuously improve our products and processes to make life easier for our customers.
Growth
When our drivers grow, our garages grow, and Go Gro grows.

Our 4-Month Operational Plan (September – December 2026)
Our objective over the next four months is simple:
Build a strong driver community, strengthen our garage partnerships, and prepare Go Gro for
long-term national growth.
1. Expand the Fuel Credit Network
Our immediate focus is increasing active drivers across our partner garages.
Priority locations include:
 Strand
 Stellenbosch
 Blue Downs

Our goal is to consistently onboard new quality drivers while maintaining excellent repayment
performance.

2. Strengthen Garage Partnerships
Every partner garage should become part of the Go Gro ecosystem.
We will:
 Supply marketing material to garages
 Allow garages to promote Go Gro to customers
 Build relationships with fuel attendants
 Encourage garages to share Go Gro content on social media
 Receive updated fuel statements every Friday
Our garages are partners—not simply fuel suppliers.

3. Grow Through Referrals
Our referral programme is one of our biggest growth engines.
Drivers earn rewards by referring quality drivers who:
 Join the platform
 Remain active
 Successfully manage their fuel accounts
This creates sustainable organic growth while improving repayment performance.

4. Improve Driver Value
We want Go Gro to become more valuable the longer someone stays with us.
Over the coming months we will continue expanding:
 Driver Rewards
 Vehicle Repair Assistance
 Vehicle Rentals

 Driver Support Services
The goal is to reward loyalty rather than simply offering fuel credit.

5. Prepare for Electric Vehicles (EVs)
Although fuel remains our primary business today, we recognize that the future of mobility is
changing.
During the remainder of 2026 we will begin researching opportunities around:
 Home EV charging solutions
 Solar-compatible charging systems
 Partnerships with charging locations
 Future EV fleet opportunities
Our goal is to position Go Gro for the next generation of mobility.

6. Marketing Focus
Our marketing strategy is practical and community-driven.
We will focus on:
 Marketing directly from partner garages
 WhatsApp communication
 Driver referrals
 Social media storytelling
 Success stories from our drivers
 Educational content about our services
We believe trust is built through relationships rather than advertising alone.

What Success Looks Like
By the end of 2026 we aim to have:
 More active drivers using our Fuel Credit Programme

 Strong relationships with every partner garage
 Increased awareness of the Go Gro brand across Cape Town
 Higher driver retention through our rewards programme
 The foundations in place for future EV services and strategic partnerships

Our Culture
We believe that every interaction matters.
Whether speaking to a driver, garage owner or supplier, we aim to be:
 Professional
 Friendly
 Responsive
 Honest
 Solution-focused
We don&#39;t simply provide services—we build lasting relationships.

# AGENTS.md — Go Gro Mobility Website

Persistent context for OpenCode when working in this repo. For the exhaustive page-by-page/field-by-field spec this project was built from, see `BUILD_PROMPT.md` in the repo root — that's the source of truth for content and requirements; this file is the source of truth for *how to work in this codebase* day-to-day.

## What this project is

Public marketing site + driver application form for Go Gro Mobility, a Cape Town eHailing/mobility company (fuel credit, vehicle rentals, driver rewards). A separate internal admin dashboard is planned as Phase 2 and is **not** part of this repo yet — do not build admin/auth/CRUD screens here unless explicitly asked; see the "Phase 2 preview" section of `BUILD_PROMPT.md` for what's coming.

## Stack

- Next.js (App Router) + TypeScript, strict mode.
- TailwindCSS for all styling — no inline hex values, no CSS-in-JS. Brand colors are defined as Tailwind theme tokens (see below); use those tokens, never raw hex, in component code.
- React Server Components by default; use `"use client"` only where interactivity actually requires it (the Apply form, nav toggle, video reduced-motion check).
- Supabase (Postgres) — **the only database**. There is no Google Sheets integration in this project; if you see references to one, they're stale, ignore them.
- Resend for transactional email (team notification on new applications).
- Deployed on Vercel.
- Forms: `react-hook-form` + `zod`. One schema per form, defined once in `lib/validation/`, imported by both the client form and the server action — never duplicate validation logic.

## Brand tokens (exact, sampled from the official logo — do not alter)

```
navy:    #0C0275  (navy-dark: #08015C)
orange:  #FB6D00
yellow:  #FBB000
grey:    #D0D0D0
offwhite: #F7F7FA
textdark: #14122E
```
Navy = dominant/structural (header, footer, major banners). Orange = primary CTA color. Yellow = small accents only, never a large fill or body text color.

## Architecture rules to respect

- **Supabase writes only happen server-side** (Server Actions or Route Handlers), using the service role key. Never call Supabase with the service role key from a client component, and never expose that key via `NEXT_PUBLIC_*`.
- **The Apply form uses partial-capture**: progress upserts to `applications` after Steps 1 and 2 with `status: 'incomplete'`, then finalizes to `status: 'new'` on submit. Don't "simplify" this into a single final insert — the abandonment-recovery behavior is intentional (see `BUILD_PROMPT.md` §3.7).
- **Side effects (email) after a Supabase write must use `waitUntil()`** from `@vercel/functions`, not a bare `try/catch` after `return` in a Server Action — Vercel can freeze the lambda before an unawaited promise resolves. Log outcomes to the `sync_status` jsonb column rather than throwing.
- **Garages are data, not code.** The garage list lives in the `garages` Supabase table (`active` boolean, `sort_order`), not a hardcoded array. Any page or form that lists garages must query the table, filtered to `active = true`.
- **Placeholder content must say so.** Vehicle Rental, Vehicle Management, Vehicle Repairs, and Rewards pages are intentionally stubbed pending real client copy — mark placeholder text with an inline comment (`{/* PLACEHOLDER: ... */}`) so it's never mistaken for finished content. Same for Terms/Privacy — never fabricate legal text.

## Conventions

- File/folder structure follows `BUILD_PROMPT.md` §1.1 — App Router routes under `app/`, shared UI in `components/ui/`, page-specific composites in `components/home/`, `components/apply/`, etc., data/integration helpers in `lib/`.
- Components: function components, typed props, no default exports for anything except `page.tsx`/`layout.tsx` files (Next.js requires those).
- Use `next/image` for all images except the hero background video, which is a native `<video>` element (autoplay/muted/loop/playsInline + poster fallback, with a `prefers-reduced-motion` check before autoplaying).
- Commit messages: short, imperative, scoped (`apply: add partial-capture upsert`, `home: wire hero video reduced-motion fallback`).

## Commands

```
npm run dev       # local dev server
npm run build      # production build (run before opening a PR)
npm run lint        # eslint
npx supabase db push   # apply pending migrations (garages table must run before applications table — see numbering in supabase/migrations)
```

## Environment variables (see `.env.example` — never commit real values)

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY        # server-only
RESEND_API_KEY
TEAM_NOTIFICATION_EMAIL
NEXT_PUBLIC_WHATSAPP_NUMBER
```

## Known gotchas

- Reduced-motion users must get the static poster image, not an autoplaying video — check `window.matchMedia('(prefers-reduced-motion: reduce)')` client-side before setting `autoPlay`.
- The reference field on the Apply form's Step 3 is optional but drives real business logic (`deposit_required`) — don't make it required, and don't skip the "no reference → 50% deposit" confirmation modal when it's left blank.
- POPIA: partial-capture means personal data is stored before final submit — the consent line on Step 1 is required copy, not optional boilerplate. Don't remove it.

## When in doubt

Check `BUILD_PROMPT.md` first — it has the full field-by-field, page-by-page spec including exact copy sourced from the client's brand doc. If something in this file and `BUILD_PROMPT.md` ever conflict, `BUILD_PROMPT.md` wins for content/requirements; this file wins for tooling/process questions it actually covers.