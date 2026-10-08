import { createAdminClient } from "@/lib/supabase/admin";
import { DOCUMENT_CATEGORIES } from "@/lib/data/types";
import type { TransactionType } from "@/lib/data/types";

export type ClientBalances = {
  driver_balance: number;
  fuel_balance: number;
  repair_balance: number;
  rental_balance: number;
  penalty_balance: number;
  weekly_fuel_limit: number;
  weekly_fuel_issued: number;
  weekly_fuel_available: number;
  next_payment_due: string | null;
  is_overdue: boolean;
};

export type ClientAccountProfile = {
  full_name: string | null;
  email: string | null;
  driver_status: string;
  car_make_model: string | null;
  car_registration: string | null;
  fuel_garage_name: string | null;
  fuel_code: string | null;
};

export async function getClientAccountProfile(
  userId: string
): Promise<ClientAccountProfile | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("driver_account_summary")
    .select(
      "full_name, email, driver_status, car_make_model, car_registration, fuel_garage_name, fuel_code"
    )
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) return null;
  const row = data as Record<string, unknown>;
  return {
    full_name: row.full_name ? String(row.full_name) : null,
    email: row.email ? String(row.email) : null,
    driver_status: String(row.driver_status ?? "pending"),
    car_make_model: row.car_make_model ? String(row.car_make_model) : null,
    car_registration: row.car_registration
      ? String(row.car_registration)
      : null,
    fuel_garage_name: row.fuel_garage_name
      ? String(row.fuel_garage_name)
      : null,
    fuel_code: row.fuel_code ? String(row.fuel_code) : null,
  };
}

export type ClientDebtBreakdown = {
  fuel: number;
  repair: number;
  rental: number;
  penalties: number;
  total: number;
};

export async function getClientDebtBreakdown(
  userId: string
): Promise<ClientDebtBreakdown | null> {
  const supabase = createAdminClient();
  const { data: summary } = await supabase
    .from("driver_account_summary")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  if (!summary) return null;
  const driverId = String(summary.id);

  const { data: bounds } = await supabase.rpc("fuel_cycle_bounds", {
    as_of: new Date().toISOString(),
  });
  const cycle = (bounds ?? [])[0] as
    | { cycle_start?: string; cycle_end?: string }
    | undefined;
  const cycleStart = cycle?.cycle_start;
  const cycleEnd = cycle?.cycle_end;

  if (!cycleStart || !cycleEnd) {
    return { fuel: 0, repair: 0, rental: 0, penalties: 0, total: 0 };
  }

  const { data, error } = await supabase
    .from("transactions")
    .select("type, amount")
    .eq("driver_id", driverId)
    .gte("created_at", cycleStart)
    .lt("created_at", cycleEnd);
  if (error) throw new Error(error.message);

  let fuel = 0;
  let repair = 0;
  let rental = 0;
  let penalties = 0;

  for (const t of (data ?? []) as { type: string; amount: number }[]) {
    const amt = Number(t.amount ?? 0);
    switch (t.type) {
      case "fuel_issue":
        fuel += amt;
        break;
      case "fuel_repayment":
        fuel -= amt;
        break;
      case "repair_issue":
        repair += amt;
        break;
      case "repair_repayment":
        repair -= amt;
        break;
      case "rental_fee":
        rental += amt;
        break;
      case "rental_repayment":
        rental -= amt;
        break;
      case "penalty_fee":
        penalties += amt;
        break;
      case "balance_correction_increase":
        penalties += amt;
        break;
      case "balance_correction_decrease":
        penalties -= amt;
        break;
      default:
        break;
    }
  }

  return {
    fuel,
    repair,
    rental,
    penalties,
    total: fuel + repair + rental + penalties,
  };
}

export type ClientTransaction = {
  id: string;
  type: TransactionType;
  amount: number;
  litres: number | null;
  vehicle_name: string | null;
  garage_name: string | null;
  created_at: string;
};

export async function getClientTransactions(
  userId: string
): Promise<ClientTransaction[]> {
  const supabase = createAdminClient();
  const { data: summary } = await supabase
    .from("driver_account_summary")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  if (!summary) return [];
  const driverId = String(summary.id);

  const { data, error } = await supabase
    .from("transactions")
    .select("id, type, amount, litres, created_at, vehicles(make_model), garages(name)")
    .eq("driver_id", driverId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return ((data ?? []) as Record<string, unknown>[]).map((row) => {
    const vehicle = (row.vehicles as { make_model?: string } | null) ?? null;
    const garage = (row.garages as { name?: string } | null) ?? null;
    return {
      id: String(row.id),
      type: String(row.type) as TransactionType,
      amount: Number(row.amount ?? 0),
      litres:
        row.litres === null || row.litres === undefined
          ? null
          : Number(row.litres),
      vehicle_name: vehicle?.make_model ?? null,
      garage_name: garage?.name ?? null,
      created_at: String(row.created_at ?? ""),
    };
  });
}

export type ClientProgrammeContext = {
  primary_service: string | null;
  hasVehicle: boolean;
  vehicle: { make_model: string; registration: string } | null;
};

export async function getClientProgrammeContext(
  userId: string
): Promise<ClientProgrammeContext> {
  const supabase = createAdminClient();
  const { data: summary } = await supabase
    .from("driver_account_summary")
    .select("id, primary_service")
    .eq("user_id", userId)
    .maybeSingle();

  if (!summary) {
    return { primary_service: null, hasVehicle: false, vehicle: null };
  }

  const profileId = String(summary.id);
  const { data: vehicles } = await supabase
    .from("vehicles")
    .select("make_model, registration")
    .eq("driver_id", profileId)
    .order("created_at", { ascending: false })
    .limit(1);

  const vehicle = (vehicles ?? [])[0] as
    | { make_model: string; registration: string }
    | undefined;

  return {
    primary_service: summary.primary_service
      ? String(summary.primary_service)
      : null,
    hasVehicle: Boolean(vehicle),
    vehicle: vehicle ? { make_model: vehicle.make_model, registration: vehicle.registration } : null,
  };
}

export async function getClientBalances(userId: string): Promise<ClientBalances | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("driver_account_summary")
    .select(
      "driver_balance, fuel_balance, repair_balance, rental_balance, penalty_balance, weekly_fuel_limit, weekly_fuel_issued, weekly_fuel_available, next_payment_due, is_overdue"
    )
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) return null;

  const row = data as Record<string, unknown>;
  return {
    driver_balance: Number(row.driver_balance ?? 0),
    fuel_balance: Number(row.fuel_balance ?? 0),
    repair_balance: Number(row.repair_balance ?? 0),
    rental_balance: Number(row.rental_balance ?? 0),
    penalty_balance: Number(row.penalty_balance ?? 0),
    weekly_fuel_limit: Number(row.weekly_fuel_limit ?? 2000),
    weekly_fuel_issued: Number(row.weekly_fuel_issued ?? 0),
    weekly_fuel_available: Number(row.weekly_fuel_available ?? 0),
    next_payment_due: row.next_payment_due ? String(row.next_payment_due) : null,
    is_overdue: Boolean(row.is_overdue),
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
  const uploadedCategories = new Set(
    docRows
      .filter((d) => d.storage_path !== "" && d.category)
      .map((d) => String(d.category))
  );
  const stillNeeded = [...requestedCategories].filter(
    (c) => !uploadedCategories.has(c)
  );

  if (stillNeeded.length > 0) {
    const labels = stillNeeded.map(
      (c) =>
        DOCUMENT_CATEGORIES.find((cat) => cat.value === c)?.label ?? c
    );
    actions.push({
      key: "upload_documents",
      label: "Upload requested documents",
      description: `${stillNeeded.length} document${stillNeeded.length === 1 ? "" : "s"} still needed: ${labels.join(", ")}.`,
      href: "/dashboard/client/documents",
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
      href: "/dashboard/client/documents",
      priority: "high",
    });
  }

  // 4. Payment due when there is an outstanding balance.
  if (balances) {
    const formattedBalance = balances.driver_balance.toLocaleString("en-ZA", {
      maximumFractionDigits: 2,
    });
    const settleHref = `/dashboard/client/support?category=balance&message=${encodeURIComponent(
      `I'd like to settle my outstanding balance of R${formattedBalance}.`
    )}`;

    if (balances.is_overdue) {
      actions.push({
        key: "overdue",
        label: "OVERDUE — settle your balance",
        description: `Your account is overdue. Outstanding: R${formattedBalance}.`,
        href: settleHref,
        priority: "high",
      });
    } else if (balances.driver_balance > 0) {
      actions.push({
        key: "make_payment",
        label: "Settle your balance",
        description: `Outstanding: R${formattedBalance}.`,
        href: settleHref,
        priority: "medium",
      });
    }
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