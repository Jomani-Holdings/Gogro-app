import { createAdminClient } from "@/lib/supabase/admin";

export type ClientBalances = {
  fuel_balance: number;
  repair_balance: number;
  total_balance: number;
};

export async function getClientBalances(userId: string): Promise<ClientBalances | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("fuel_balance, repair_balance")
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) return null;

  const fuel = Number((data as Record<string, unknown>).fuel_balance ?? 0);
  const repair = Number((data as Record<string, unknown>).repair_balance ?? 0);
  return {
    fuel_balance: fuel,
    repair_balance: repair,
    total_balance: fuel + repair,
  };
}

export type ClientRequiredAction = {
  key: string;
  label: string;
  description: string;
  href: string;
  priority: "high" | "medium" | "low";
};

export async function getClientRequiredActions(
  userId: string
): Promise<ClientRequiredAction[]> {
  const supabase = createAdminClient();

  const [leadRes, docsRes, balances] = await Promise.all([
    supabase
      .from("leads")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle(),
    supabase
      .from("documents")
      .select("category, storage_path, status")
      .eq("user_id", userId),
    getClientBalances(userId),
  ]);

  const leadId = leadRes.data?.id ? String(leadRes.data.id) : null;
  const actions: ClientRequiredAction[] = [];

  // 1. Complete an in-progress application.
  if (leadId) {
    const { data: submissions } = await supabase
      .from("form_submissions")
      .select("id, status, access_token, form_templates(name)")
      .eq("lead_id", leadId)
      .order("created_at", { ascending: false });

    const pending = (submissions ?? []).find(
      (s) => s.status === "pending" || s.status === "draft"
    ) as Record<string, unknown> | undefined;

    if (pending && pending.access_token) {
      actions.push({
        key: "complete_application",
        label: "Complete your application",
        description: String(
          (pending.form_templates as { name?: string } | null)?.name ??
            "Application"
        ),
        href: `/apply/form/${String(pending.id)}?token=${String(pending.access_token)}`,
        priority: "high",
      });
    }
  }

  // 2. Upload requested documents (placeholder requests still pending).
  const docRows = (docsRes.data ?? []) as Record<string, unknown>[];
  const requestedCategories = new Set(
    docRows
      .filter(
        (d) => d.storage_path === "" && d.status === "pending" && d.category
      )
      .map((d) => String(d.category))
  );
  const approvedCategories = new Set(
    docRows.filter((d) => d.status === "approved" && d.category).map((d) => String(d.category))
  );
  const stillNeeded = [...requestedCategories].filter(
    (c) => !approvedCategories.has(c)
  );

  if (stillNeeded.length > 0) {
    actions.push({
      key: "upload_documents",
      label: "Upload requested documents",
      description: `${stillNeeded.length} document${stillNeeded.length === 1 ? "" : "s"} still needed.`,
      href: "/dashboard/client#documents",
      priority: "high",
    });
  }

  // 3. Sign the contract if available and not yet signed.
  const contractDownloadUrl = await getClientContractUrl(supabase, leadId);
  const hasApprovedContract = docRows.some(
    (d) => d.category === "signed_contract" && d.status === "approved"
  );
  if (contractDownloadUrl && !hasApprovedContract) {
    actions.push({
      key: "sign_contract",
      label: "Sign your contract",
      description: "Download, sign and upload your contract.",
      href: "/dashboard/client#documents",
      priority: "high",
    });
  }

  // 4. Payment due when there is an outstanding balance.
  if (balances && balances.total_balance > 0) {
    actions.push({
      key: "make_payment",
      label: "Settle your balance",
      description: `Outstanding: R${balances.total_balance.toLocaleString("en-ZA", {
        maximumFractionDigits: 2,
      })}.`,
      href: "/dashboard/client/support",
      priority: "medium",
    });
  }

  return actions;
}

async function getClientContractUrl(
  supabase: ReturnType<typeof createAdminClient>,
  leadId: string | null
): Promise<string | null> {
  if (!leadId) return null;
  const { data } = await supabase
    .from("form_submissions")
    .select("form_templates(contract_document_path)")
    .eq("lead_id", leadId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const contractPath = (data as {
    form_templates?: { contract_document_path?: string | null } | null;
  } | null)?.form_templates?.contract_document_path;

  return contractPath ?? null;
}

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