-- 9. Email template rewrite: apply the client-branded copy and button CTAs.
-- Safe to run regardless of migration 008 state (upserts by slug).

-- Remove legacy templates from the pre-CRM flow, if present.
delete from public.email_templates
where slug in ('join_request_admin', 'join_request_driver', 'application_approved');

-- Client + admin CRM templates (insert or update).
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
on conflict (slug) do update set
  name = excluded.name,
  subject = excluded.subject,
  from_address = excluded.from_address,
  variables = excluded.variables,
  body = excluded.body,
  updated_at = now();