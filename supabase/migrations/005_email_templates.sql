-- Phase 2: email templates CMS.

create table public.email_templates (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  subject text not null default '',
  from_address text,
  reply_to text,
  variables jsonb not null default '[]'::jsonb,
  body jsonb,
  updated_at timestamptz not null default now()
);

-- Fixed templates referenced by server actions.
insert into public.email_templates (slug, name, subject, from_address, variables, body) values
  (
    'join_request_admin',
    'New Driver Application (Admin Notification)',
    'New driver application: {{driver.name}}',
    'Go Gro Mobility <onboarding@gogromobility.co.za>',
    '[
      {"key":"driver.name","label":"Driver name"},
      {"key":"driver.email","label":"Driver email"},
      {"key":"driver.phone","label":"Contact number"},
      {"key":"driver.idNumber","label":"ID / Passport"},
      {"key":"driver.address","label":"Physical address"},
      {"key":"driver.car","label":"Car make / model / year"},
      {"key":"driver.registration","label":"Car registration"},
      {"key":"driver.platform","label":"eHailing platform"},
      {"key":"driver.driverType","label":"Driver type"},
      {"key":"driver.garage","label":"Garage"},
      {"key":"driver.weeklyCreditBand","label":"Weekly credit band"},
      {"key":"driver.referenceName","label":"Reference name"},
      {"key":"driver.heardAboutUs","label":"Heard about us"},
      {"key":"driver.depositRequired","label":"Deposit required"},
      {"key":"driver.submittedAt","label":"Submitted at"},
      {"key":"admin.reviewLink","label":"Review link"}
    ]'::jsonb,
    '{"type":"doc","content":[{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"New driver application"}]},{"type":"paragraph","content":[{"type":"text","text":"A driver has just submitted a join request. Their full details are below."}]},{"type":"heading","attrs":{"level":3},"content":[{"type":"text","text":"Personal information"}]},{"type":"bulletList","content":[{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Name: {{driver.name}}"}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Email: {{driver.email}}"}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Contact: {{driver.phone}}"}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"ID / Passport: {{driver.idNumber}}"}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Address: {{driver.address}}"}]}]}]},{"type":"heading","attrs":{"level":3},"content":[{"type":"text","text":"Vehicle & platform"}]},{"type":"bulletList","content":[{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Car: {{driver.car}}"}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Registration: {{driver.registration}}"}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Platform: {{driver.platform}}"}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Driver type: {{driver.driverType}}"}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Garage: {{driver.garage}}"}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Weekly credit: {{driver.weeklyCreditBand}}"}]}]}]},{"type":"heading","attrs":{"level":3},"content":[{"type":"text","text":"References & marketing"}]},{"type":"bulletList","content":[{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Heard about us: {{driver.heardAboutUs}}"}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Reference: {{driver.referenceName}}"}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Deposit required: {{driver.depositRequired}}"}]}]}]},{"type":"paragraph","content":[{"type":"text","text":"Submitted at: {{driver.submittedAt}}"}]},{"type":"paragraph","content":[{"type":"text","marks":[{"type":"link","attrs":{"href":"{{admin.reviewLink}}"}}],"text":"View application in dashboard"}]}]}'
  ),
  (
    'join_request_driver',
    'Driver Application Received (Confirmation)',
    'We received your application',
    'Go Gro Mobility <onboarding@gogromobility.co.za>',
    '[
      {"key":"driver.name","label":"Driver name"},
      {"key":"driver.email","label":"Driver email"},
      {"key":"driver.submittedAt","label":"Submitted at"}
    ]'::jsonb,
    '{"type":"doc","content":[{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"Application received"}]},{"type":"paragraph","content":[{"type":"text","text":"Hi {{driver.name}},"}]},{"type":"paragraph","content":[{"type":"text","text":"Thanks for applying to join Go Gro Mobility. We have received your details and our team will be in touch shortly."}]},{"type":"paragraph","content":[{"type":"text","text":"Submitted at: {{driver.submittedAt}}"}]}]}'
  ),
  (
    'application_approved',
    'Application Approved',
    'Your application has been approved',
    'Go Gro Mobility <onboarding@gogromobility.co.za>',
    '[
      {"key":"driver.name","label":"Driver name"},
      {"key":"driver.email","label":"Driver email"}
    ]'::jsonb,
    '{"type":"doc","content":[{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"You''re approved!"}]},{"type":"paragraph","content":[{"type":"text","text":"Hi {{driver.name}}, congratulations — your application has been approved. Welcome to Go Gro Mobility."}]}]}'
  );

alter table public.email_templates enable row level security;
create policy "email_templates_admin_write" on public.email_templates for all using (true);
