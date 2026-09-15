-- Password reset codes for the code-based (Resend) password reset flow.
-- A user requests a code, receives it by email, and types it into a wizard
-- instead of clicking a magic link.

create table public.password_reset_codes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  email text not null,
  code text not null,
  expires_at timestamptz not null,
  used boolean not null default false,
  created_at timestamptz not null default now()
);

create index password_reset_codes_email_idx
  on public.password_reset_codes (email, created_at);

create index password_reset_codes_code_idx
  on public.password_reset_codes (code);

-- Email template for the reset code (editable later in the admin dashboard).
insert into public.email_templates (slug, name, subject, from_address, variables, body) values
  (
    'password_reset_code',
    'Password Reset Code',
    'Your Go Gro Mobility password reset code is {{code}}',
    'Go Gro Mobility <onboarding@gogromobility.co.za>',
    '[{"key":"client.name","label":"Client name"},{"key":"code","label":"Reset code"}]'::jsonb,
    '{
      "type":"doc",
      "content":[
        {"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"Password reset"}]},
        {"type":"paragraph","content":[{"type":"text","text":"Hi {{client.name}},"}]},
        {"type":"paragraph","content":[{"type":"text","text":"We received a request to reset your password. Enter this code in the reset wizard to choose a new password:"}]},
        {"type":"paragraph","attrs":{"align":"center"},"content":[{"type":"text","marks":[{"type":"bold"}],"text":"{{code}}"}]},
        {"type":"paragraph","content":[{"type":"text","text":"The code expires in 15 minutes. If you didn''t request this, you can safely ignore this email."}]},
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