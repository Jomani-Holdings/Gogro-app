import { createAdminClient } from "@/lib/supabase/admin";
import type { Document, DocumentCategory } from "@/lib/data/types";

function mapRow(row: Record<string, unknown>): Document {
  return {
    id: String(row.id),
    lead_id: row.lead_id ? String(row.lead_id) : null,
    user_id: row.user_id ? String(row.user_id) : null,
    category: (row.category as DocumentCategory) ?? "id_copy",
    filename: String(row.filename),
    storage_path: String(row.storage_path),
    status: (row.status as Document["status"]) ?? "pending",
    uploaded_by: row.uploaded_by ? String(row.uploaded_by) : null,
    notes: row.notes ? String(row.notes) : null,
    created_at: String(row.created_at ?? ""),
    updated_at: String(row.updated_at ?? ""),
  };
}

export async function getDocumentsForLead(leadId: string): Promise<Document[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .eq("lead_id", leadId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return ((data as Record<string, unknown>[]) ?? []).map(mapRow);
}

export async function getDocumentsForUser(userId: string): Promise<Document[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return ((data as Record<string, unknown>[]) ?? []).map(mapRow);
}

export async function getDocumentByStoragePath(
  storagePath: string
): Promise<Document | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .eq("storage_path", storagePath)
    .maybeSingle();

  if (error || !data) return null;
  return mapRow(data as Record<string, unknown>);
}

export async function getClientDocumentsContext(
  userId: string
): Promise<{
  documents: Document[];
  contractDownloadUrl: string | null;
}> {
  const supabase = createAdminClient();

  const { data: lead } = await supabase
    .from("leads")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  const leadId = lead?.id ? String(lead.id) : null;

  const [docsResult, contractResult] = await Promise.all([
    supabase
      .from("documents")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false }),
    leadId
      ? supabase
          .from("form_submissions")
          .select("form_templates(contract_document_path)")
          .eq("lead_id", leadId)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),
  ]);

  const contractPath =
    (contractResult?.data as {
      form_templates?: { contract_document_path?: string | null } | null;
    } | null)?.form_templates?.contract_document_path ?? null;

  return {
    documents: ((docsResult.data as Record<string, unknown>[]) ?? []).map(mapRow),
    contractDownloadUrl: contractPath ?? null,
  };
}