-- Phase 9: Contract + document email templates.
insert into public.email_templates (slug, name, subject, from_address, variables, body) values
  (
    'contract_available_client',
    'Contract ready to sign',
    'Your {{form.name}} contract is ready to sign',
    'Go Gro Mobility <onboarding@gogromobility.co.za>',
    '[{"key":"client.name","label":"Client name"},{"key":"form.name","label":"Form name"},{"key":"form.link","label":"Form link"}]'::jsonb,
    '{
      "type":"doc",
      "content":[
        {"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"Your contract is ready"}]},
        {"type":"paragraph","content":[{"type":"text","text":"Hi {{client.name}},"}]},
        {"type":"paragraph","content":[{"type":"text","text":"Your {{form.name}} includes a contract you need to review and sign. Open your application below to download it."}]},
        {"type":"paragraph","content":[{"type":"text","text":"After signing, upload the signed copy from the documents section of your dashboard."}]},
        {"type":"emailButton","attrs":{"href":"{{form.link}}","label":"Review &amp; sign contract","align":"center"}},
        {"type":"paragraph","content":[{"type":"text","text":"Best,"}]},
        {"type":"paragraph","content":[{"type":"text","text":"The Go Gro Team"}]}
      ]
    }'::jsonb
  ),
  (
    'documents_requested_client',
    'Documents needed to continue',
    'We need a few documents from you',
    'Go Gro Mobility <onboarding@gogromobility.co.za>',
    '[{"key":"client.name","label":"Client name"},{"key":"document.categories","label":"Document categories"},{"key":"dashboard.link","label":"Dashboard link"}]'::jsonb,
    '{
      "type":"doc",
      "content":[
        {"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"We need a few documents"}]},
        {"type":"paragraph","content":[{"type":"text","text":"Hi {{client.name}},"}]},
        {"type":"paragraph","content":[{"type":"text","text":"To keep your application moving, please upload the following from your dashboard:"}]},
        {"type":"paragraph","content":[{"type":"text","text":"{{document.categories}}"}]},
        {"type":"emailButton","attrs":{"href":"{{dashboard.link}}","label":"Upload documents","align":"center"}},
        {"type":"paragraph","content":[{"type":"text","text":"Best,"}]},
        {"type":"paragraph","content":[{"type":"text","text":"The Go Gro Team"}]}
      ]
    }'::jsonb
  ),
  (
    'contract_signed_admin',
    'Signed contract uploaded (Admin Notification)',
    'Signed contract uploaded: {{client.name}}',
    'Go Gro Mobility <onboarding@gogromobility.co.za>',
    '[{"key":"client.name","label":"Client name"},{"key":"admin.reviewLink","label":"Review link"}]'::jsonb,
    '{
      "type":"doc",
      "content":[
        {"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"Signed contract received"}]},
        {"type":"paragraph","content":[{"type":"text","text":"{{client.name}} has uploaded a signed contract."}]},
        {"type":"paragraph","content":[{"type":"text","text":"Review the document and approve or reject it from the admin dashboard."}]},
        {"type":"emailButton","attrs":{"href":"{{admin.reviewLink}}","label":"Review signed contract","align":"center"}}
      ]
    }'::jsonb
  )
on conflict (slug) do nothing;