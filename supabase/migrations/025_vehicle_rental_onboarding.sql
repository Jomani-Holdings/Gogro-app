-- Vehicle Rental onboarding: profile fields, view update, and the
-- vehicle-rental form template (mirrors the fuel-credit pattern).

-- 1. Rental + programme fields on profiles.
alter table public.profiles
  add column if not exists id_number text,
  add column if not exists suburb text,
  add column if not exists license_valid text,
  add column if not exists years_experience text,
  add column if not exists preferred_vehicle_category text,
  add column if not exists marketing_source text,
  add column if not exists primary_service text;

-- 2. Recreate driver_account_summary to expose the new columns.
drop view if exists public.driver_account_summary;

create or replace view public.driver_account_summary as
select
  p.id,
  p.user_id,
  p.full_name,
  p.email,
  p.phone,
  p.role,
  p.suspended,
  p.driver_status,
  p.car_make_model,
  p.car_registration,
  p.id_number,
  p.suburb,
  p.license_valid,
  p.years_experience,
  p.preferred_vehicle_category,
  p.marketing_source,
  p.primary_service,
  p.weekly_fuel_limit,
  p.driver_balance,
  p.fuel_code,
  p.fuel_garage_id,
  g.name as fuel_garage_name,
  p.payment_due_day,
  p.payment_due_time,
  p.payment_arrangement_due_date,
  p.payment_arrangement_notes,
  p.overlimit_count,
  p.created_at,
  public.driver_weekly_fuel_issued(p.id, now()) as weekly_fuel_issued,
  public.driver_weekly_fuel_issued_litres(p.id, now()) as weekly_fuel_issued_litres,
  p.weekly_fuel_limit - public.driver_weekly_fuel_issued(p.id, now()) as weekly_fuel_available,
  public.driver_next_payment_due(p) as next_payment_due,
  (p.driver_balance > 0 and now() > public.driver_next_payment_due(p)) as is_overdue
from public.profiles p
left join public.garages g on g.id = p.fuel_garage_id;

-- 3. Seed the vehicle-rental form template.
insert into public.form_templates (
  slug, service_id, name, status, intro_content, field_schema,
  terms_content, confirmation_message, email_template_slug, sort_order
) values (
  'vehicle-rental',
  (select id from public.services where slug = 'vehicle-rental' limit 1),
  'Vehicle Rental Application',
  'published',
  '{"type":"doc","content":[{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"Go Gro Vehicle Rental Application"}]},{"type":"paragraph","content":[{"type":"text","text":"Go Gro Mobility is a mobility solutions company focused on helping entrepreneurs move, operate and grow. We connect mobility entrepreneurs with the vehicles, fuel, maintenance support, technology and services they need to keep moving."}]},{"type":"paragraph","content":[{"type":"text","text":"One of our customer agents will contact you. If you have any issues, please contact us at info@gogromobility.co.za."}]}]}'::jsonb,
  '[
    {"key":"fullName","type":"text","label":"Full Name and Surname","required":true},
    {"key":"email","type":"email","label":"Email","required":true},
    {"key":"phone","type":"tel","label":"Mobile / WhatsApp Number","required":true},
    {"key":"idNumber","type":"text","label":"ID / Passport Number","required":true},
    {"key":"suburb","type":"text","label":"Area/Suburb where you live?","required":true},
    {"key":"hasValidLicensePrdp","type":"radio","label":"Do you have a valid South African driver''s license (PrDP)?","options":["Yes","No","Other"],"required":true},
    {"key":"yearsExperience","type":"select","label":"How long have you been working as an e-hailing driver?","options":["1 - 3 years","3 - 6 years","6 years and more"],"required":true},
    {"key":"preferredVehicleCategory","type":"select","label":"Preferred vehicle/category","options":["Hatchback/ Go","Sedan/ Comfort","SUV","7 Seater or more/ XL"],"required":true},
    {"key":"marketingSource","type":"select","label":"How did you hear about us?","options":["eHailing Groups","Facebook","Fellow Driver"],"required":true}
  ]'::jsonb,
  '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"By submitting this form you consent to Go Gro Mobility processing your personal information in line with POPIA to assess your enquiry."}]}]}'::jsonb,
  'Your vehicle rental application has been received. Create a password to track its progress.',
  'form_invitation_client',
  2
) on conflict (slug) do nothing;