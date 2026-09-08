import { createAdminClient } from "@/lib/supabase/admin";

export type ClientLead = {
  id: string;
  status: string;
  full_name: string;
  email: string;
  phone: string;
  service_name: string | null;
  created_at: string;
};

export type ClientSubmission = {
  id: string;
  status: string;
  template_name: string | null;
  access_token: string | null;
  submitted_at: string | null;
};

export async function getClientLeadAndSubmissions(userId: string): Promise<{
  lead: ClientLead | null;
  submissions: ClientSubmission[];
}> {
  const supabase = createAdminClient();

  const { data: lead } = await supabase
    .from("leads")
    .select("*, services(name)")
    .eq("user_id", userId)
    .maybeSingle();

  if (!lead) return { lead: null, submissions: [] };

  const leadRow = lead as Record<string, unknown>;
  const service = (leadRow.services as { name?: string } | null) ?? null;

  const clientLead: ClientLead = {
    id: String(leadRow.id),
    status: String(leadRow.status ?? "new"),
    full_name: String(leadRow.full_name ?? ""),
    email: String(leadRow.email ?? ""),
    phone: String(leadRow.phone ?? ""),
    service_name: service?.name ?? null,
    created_at: String(leadRow.created_at ?? ""),
  };

  const { data: submissions } = await supabase
    .from("form_submissions")
    .select(
      "id, status, access_token, submitted_at, form_templates(name)"
    )
    .eq("lead_id", clientLead.id)
    .order("created_at", { ascending: false });

  const rows = ((submissions as Record<string, unknown>[]) ?? []).map(
    (row) => {
      const template = (row.form_templates as { name?: string } | null) ?? null;
      return {
        id: String(row.id),
        status: String(row.status ?? "pending"),
        template_name: template?.name ?? null,
        access_token: row.access_token ? String(row.access_token) : null,
        submitted_at: row.submitted_at ? String(row.submitted_at) : null,
      };
    }
  );

  return { lead: clientLead, submissions: rows };
}