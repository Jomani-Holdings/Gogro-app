-- Phase 3: CRM + dynamic application forms.
-- Converts the monolithic `applications` table into a CRM pipeline:
--   leads -> form_templates -> form_submissions + communications.

-- 1. Rename driver role -> client (platform houses multiple client types).
alter table public.profiles alter column role set default 'client';
update public.profiles set role = 'client' where role = 'driver';

-- 2. Status enums.
create type public.lead_status as enum (
  'new','contacted','form_sent','form_started','submitted','approved','rejected','dormant'
);

create type public.submission_status as enum (
  'pending','draft','submitted','in_review','approved','rejected'
);

create type public.communication_type as enum ('email','sms','note','call');
create type public.communication_direction as enum ('inbound','outbound');

-- 3. Leads (central CRM record).
create table public.leads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  service_id uuid references public.services(id) on delete set null,
  full_name text not null,
  email text not null,
  phone text not null,
  status public.lead_status not null default 'new',
  source text,
  notes text,
  assigned_to uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index leads_email_key on public.leads (email);
create index leads_status_idx on public.leads (status);
create index leads_user_id_idx on public.leads (user_id);

-- 4. Form templates (CMS form builder).
create table public.form_templates (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  service_id uuid references public.services(id) on delete set null,
  name text not null,
  status text not null default 'draft',
  intro_content jsonb,
  field_schema jsonb not null default '[]'::jsonb,
  terms_content jsonb,
  confirmation_message text,
  email_template_slug text,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index form_templates_service_id_idx on public.form_templates (service_id);
create index form_templates_status_idx on public.form_templates (status);

-- 5. Form submissions (token-gated, public until password is created).
create table public.form_submissions (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  form_template_id uuid not null references public.form_templates(id) on delete cascade,
  status public.submission_status not null default 'pending',
  data jsonb not null default '{}'::jsonb,
  access_token uuid unique,
  access_token_expires_at timestamptz,
  submitted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index form_submissions_lead_id_idx on public.form_submissions (lead_id);
create index form_submissions_status_idx on public.form_submissions (status);
create index form_submissions_access_token_idx on public.form_submissions (access_token);

-- 6. Communications audit log (automated sends + manual notes).
create table public.communications (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  type public.communication_type not null default 'note',
  direction public.communication_direction not null default 'outbound',
  subject text,
  body text,
  metadata jsonb default '{}'::jsonb,
  sent_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index communications_lead_id_idx on public.communications (lead_id);
create index communications_sent_at_idx on public.communications (sent_at);

-- 7. RLS. Admin writes use the service role and bypass RLS (no policies needed).
alter table public.leads enable row level security;
alter table public.form_templates enable row level security;
alter table public.form_submissions enable row level security;
alter table public.communications enable row level security;

create policy "leads_own_read" on public.leads
  for select using (auth.uid() = user_id);

create policy "form_templates_public_read" on public.form_templates
  for select using (status = 'published');

create policy "form_submissions_own_read" on public.form_submissions
  for select using (lead_id in (select id from public.leads where user_id = auth.uid()));

create policy "communications_own_read" on public.communications
  for select using (lead_id in (select id from public.leads where user_id = auth.uid()));

-- 8. Seed the MVP fuel-credit form template.
insert into public.form_templates (
  slug, service_id, name, status, intro_content, field_schema,
  terms_content, confirmation_message, email_template_slug, sort_order
) values (
  'fuel-credit',
  (select id from public.services where slug = 'fuel-credit' limit 1),
  'Fuel Credit Application',
  'published',
  '{"type":"doc","content":[{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"Fuel Credit Application"}]},{"type":"paragraph","content":[{"type":"text","text":"Complete the details below so we can assess your fuel credit application."}]}]}'::jsonb,
  '[
    {"key":"fullName","type":"text","label":"Full Name and Surname","required":true},
    {"key":"email","type":"email","label":"Email","required":true},
    {"key":"phone","type":"tel","label":"Contact Number","required":true},
    {"key":"idOrPassport","type":"text","label":"ID / Passport Number","required":true},
    {"key":"physicalAddress","type":"text","label":"Physical Address","required":true},
    {"key":"carMakeModelYear","type":"text","label":"Car Make / Model / Year","required":true},
    {"key":"carRegistration","type":"text","label":"Car Registration Number","required":true},
    {"key":"ehailingPlatform","type":"radio","label":"eHailing Platform","options":["UBER","BOLT","IN DRIVE","Private trips","Other"],"required":true},
    {"key":"ehailingPlatformOther","type":"text","label":"Which platform do you drive with?","required":false,"showWhen":{"ehailingPlatform":"Other"}},
    {"key":"driverType","type":"radio","label":"Driver Type","options":["Fleet","Own Car"],"required":true},
    {"key":"garageId","type":"select","label":"Garage Required","required":true,"optionsSource":"garages"},
    {"key":"weeklyCreditBand","type":"select","label":"Weekly Fuel Credit","options":["R 0 - R 1 000","R 1 001 - R 2 000","R 2 001 - R 3 000"],"required":true},
    {"key":"heardAboutUs","type":"select","label":"How did you hear about us?","options":["Social Media","Fuel Garage","eHailing WhatsApp Groups"],"required":true},
    {"key":"referenceName","type":"text","label":"Go Gro Fuel Reference (optional)","required":false}
  ]'::jsonb,
  '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"By submitting this form you consent to Go Gro Mobility processing your information under POPIA."}]},{"type":"paragraph","content":[{"type":"text","text":"If you do not have a reference, a 50% deposit may be required."}]}]}'::jsonb,
  'Your fuel credit application has been received. Create a password to track its progress.',
  'form_invitation_driver',
  1
) on conflict (slug) do nothing;

-- 9. Migrate existing applications into leads + submissions.
insert into public.leads (
  user_id, service_id, full_name, email, phone, status, created_at, updated_at
)
select
  a.user_id,
  (select id from public.services where slug = 'fuel-credit' limit 1),
  a.full_name,
  lower(a.email),
  a.contact_number,
  (case
    when a.status = 'approved' then 'approved'
    when a.status = 'rejected' then 'rejected'
    when a.status = 'incomplete' then 'new'
    else 'submitted'
  end)::public.lead_status,
  a.created_at,
  a.updated_at
from public.applications a
on conflict (email) do update set
  user_id = excluded.user_id,
  full_name = excluded.full_name,
  phone = excluded.phone,
  status = excluded.status,
  updated_at = excluded.updated_at;

insert into public.form_submissions (
  lead_id, form_template_id, status, data, submitted_at, created_at, updated_at
)
select
  l.id,
  (select id from public.form_templates where slug = 'fuel-credit' limit 1),
  (case
    when a.status = 'approved' then 'approved'
    when a.status = 'rejected' then 'rejected'
    else 'submitted'
  end)::public.submission_status,
  jsonb_build_object(
    'fullName', a.full_name,
    'email', a.email,
    'phone', a.contact_number,
    'idOrPassport', a.id_or_passport_number,
    'physicalAddress', a.physical_address,
    'carMakeModelYear', a.car_make_model_year,
    'carRegistration', a.car_registration_number,
    'ehailingPlatform', a.ehailing_platform,
    'ehailingPlatformOther', a.ehailing_platform_other,
    'driverType', a.driver_type,
    'garageId', a.garage_id,
    'weeklyCreditBand', a.weekly_credit_band,
    'heardAboutUs', a.heard_about_us,
    'referenceName', a.reference_name,
    'depositRequired', a.deposit_required
  ),
  case when a.status not in ('incomplete','new','in_review') then a.created_at end,
  a.created_at,
  a.updated_at
from public.applications a
join public.leads l on l.email = lower(a.email);

-- 10. Seed CRM email templates.
insert into public.email_templates (slug, name, subject, from_address, variables, body) values
  (
    'lead_received_admin',
    'Action Required: New Lead (Admin Notification)',
    'Action Required: New Lead – {{client.name}}',
    'Go Gro Mobility <onboarding@gogromobility.co.za>',
    '[{"key":"client.name","label":"Client name"},{"key":"client.email","label":"Email"},{"key":"client.phone","label":"Phone"},{"key":"client.service","label":"Service"},{"key":"admin.reviewLink","label":"Review link"}]'::jsonb,
    '{
      "type":"doc",
      "content":[
        {"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"New lead"}]},
        {"type":"paragraph","content":[{"type":"text","text":"A new mobility entrepreneur has expressed interest. Their contact details are below:"}]},
        {"type":"bulletList","content":[
          {"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Name: {{client.name}}"}]}]},
          {"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Email: {{client.email}}"}]}]},
          {"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Phone: {{client.phone}}"}]}]},
          {"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Service of Interest: {{client.service}}"}]}]}
        ]},
        {"type":"emailButton","attrs":{"href":"{{admin.reviewLink}}","label":"Review Lead Profile","align":"center"}}
      ]
    }'::jsonb
  ),
  (
    'lead_received_client',
    'Welcome to Go Gro Mobility',
    'Welcome to Go Gro Mobility! Let''s get moving',
    'Go Gro Mobility <onboarding@gogromobility.co.za>',
    '[{"key":"client.name","label":"Client name"},{"key":"client.email","label":"Email"}]'::jsonb,
    '{
      "type":"doc",
      "content":[
        {"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"Thanks for getting in touch"}]},
        {"type":"paragraph","content":[{"type":"text","text":"Hi {{client.name}},"}]},
        {"type":"paragraph","content":[{"type":"text","text":"Thanks for reaching out to us. We''ve received your details and are thrilled you''re taking the next step in your mobility journey."}]},
        {"type":"paragraph","content":[{"type":"text","text":"Our team is reviewing your information right now and will reach out shortly to discuss how we can help your business grow."}]},
        {"type":"paragraph","content":[{"type":"text","text":"Speak soon,"}]},
        {"type":"paragraph","content":[{"type":"text","text":"The Go Gro Team"}]}
      ]
    }'::jsonb
  ),
  (
    'form_invitation_client',
    'Complete your application',
    'Next steps: Your Go Gro Mobility {{form.name}}',
    'Go Gro Mobility <onboarding@gogromobility.co.za>',
    '[{"key":"client.name","label":"Client name"},{"key":"form.name","label":"Form name"},{"key":"form.link","label":"Form link"}]'::jsonb,
    '{
      "type":"doc",
      "content":[
        {"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"Complete your {{form.name}}"}]},
        {"type":"paragraph","content":[{"type":"text","text":"Hi {{client.name}},"}]},
        {"type":"paragraph","content":[{"type":"text","text":"It was great connecting with you. To keep things moving forward, we just need a few more details."}]},
        {"type":"paragraph","content":[{"type":"text","text":"Please take a few minutes to complete your {{form.name}} using your secure link below:"}]},
        {"type":"emailButton","attrs":{"href":"{{form.link}}","label":"Complete My Application","align":"center"}},
        {"type":"paragraph","content":[{"type":"text","text":"Let us know if you have any questions along the way!"}]},
        {"type":"paragraph","content":[{"type":"text","text":"Best,"}]},
        {"type":"paragraph","content":[{"type":"text","text":"The Go Gro Team"}]}
      ]
    }'::jsonb
  ),
  (
    'form_submitted_admin',
    'Application submitted (Admin Notification)',
    'Form Submitted: {{form.name}} from {{client.name}}',
    'Go Gro Mobility <onboarding@gogromobility.co.za>',
    '[{"key":"client.name","label":"Client name"},{"key":"client.email","label":"Email"},{"key":"form.name","label":"Form name"},{"key":"admin.reviewLink","label":"Review link"}]'::jsonb,
    '{
      "type":"doc",
      "content":[
        {"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"Application submitted"}]},
        {"type":"paragraph","content":[{"type":"text","text":"{{client.name}} has just completed and submitted their {{form.name}}."}]},
        {"type":"paragraph","content":[{"type":"text","text":"The application is ready for your review."}]},
        {"type":"emailButton","attrs":{"href":"{{admin.reviewLink}}","label":"Review Application","align":"center"}}
      ]
    }'::jsonb
  ),
  (
    'form_submitted_client',
    'Application received',
    'We''ve got it! Your {{form.name}} is under review',
    'Go Gro Mobility <onboarding@gogromobility.co.za>',
    '[{"key":"client.name","label":"Client name"},{"key":"form.name","label":"Form name"}]'::jsonb,
    '{
      "type":"doc",
      "content":[
        {"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"Application received"}]},
        {"type":"paragraph","content":[{"type":"text","text":"Hi {{client.name}},"}]},
        {"type":"paragraph","content":[{"type":"text","text":"Just a quick note to let you know we successfully received your {{form.name}}."}]},
        {"type":"paragraph","content":[{"type":"text","text":"Our team is looking over your details right now. We work as fast as we can, so keep an eye on your inbox for the next update."}]},
        {"type":"paragraph","content":[{"type":"text","text":"Best,"}]},
        {"type":"paragraph","content":[{"type":"text","text":"The Go Gro Team"}]}
      ]
    }'::jsonb
  ),
  (
    'submission_approved_client',
    'Application approved',
    'Great news! Your {{form.name}} is approved',
    'Go Gro Mobility <onboarding@gogromobility.co.za>',
    '[{"key":"client.name","label":"Client name"},{"key":"form.name","label":"Form name"}]'::jsonb,
    '{
      "type":"doc",
      "content":[
        {"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"You''re approved!"}]},
        {"type":"paragraph","content":[{"type":"text","text":"Hi {{client.name}},"}]},
        {"type":"paragraph","content":[{"type":"text","text":"Congratulations—your {{form.name}} has been fully approved!"}]},
        {"type":"paragraph","content":[{"type":"text","text":"We are excited to partner with you and support your business growth. Your client dashboard has been updated with your next steps."}]},
        {"type":"paragraph","content":[{"type":"text","text":"Welcome to the Go Gro ecosystem. Let''s get you on the road!"}]},
        {"type":"paragraph","content":[{"type":"text","text":"Best,"}]},
        {"type":"paragraph","content":[{"type":"text","text":"The Go Gro Team"}]}
      ]
    }'::jsonb
  ),
  (
    'submission_rejected_client',
    'Application update',
    'Important update regarding your {{form.name}}',
    'Go Gro Mobility <onboarding@gogromobility.co.za>',
    '[{"key":"client.name","label":"Client name"},{"key":"form.name","label":"Form name"}]'::jsonb,
    '{
      "type":"doc",
      "content":[
        {"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"Update on your application"}]},
        {"type":"paragraph","content":[{"type":"text","text":"Hi {{client.name}},"}]},
        {"type":"paragraph","content":[{"type":"text","text":"We''ve finished reviewing your {{form.name}}. At this stage, we aren''t able to move forward with the current application. Contact support to learn more."}]},
        {"type":"paragraph","content":[{"type":"text","text":"Best,"}]},
        {"type":"paragraph","content":[{"type":"text","text":"The Go Gro Team"}]}
      ]
    }'::jsonb
  )
on conflict (slug) do nothing;

-- 11. Old monolithic applications table removed.
drop table public.applications;
