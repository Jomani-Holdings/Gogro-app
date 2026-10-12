"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { notifyUser } from "@/lib/notifications";
import { logTransaction } from "@/app/dashboard/admin/transactions/actions";

export type ReviewPaymentProofResult = {
  ok: boolean;
  error?: string;
};

export type ReviewPaymentProofInput = {
  proofId: string;
  action: "approved" | "rejected" | "disputed";
  amount?: number;
  notes?: string;
};

const ACTIONS = ["approved", "rejected", "disputed"] as const;

export async function reviewPaymentProof(
  input: ReviewPaymentProofInput
): Promise<ReviewPaymentProofResult> {
  const adminProfile = await requireAdmin();
  const admin = createAdminClient();

  const proofId = String(input.proofId ?? "").trim();
  const action = String(input.action ?? "").trim();
  const notes = input.notes?.trim() ? input.notes.trim() : null;
  const amount = Number(input.amount ?? 0);

  if (!proofId) return { ok: false, error: "Missing payment proof." };
  if (!ACTIONS.includes(action as (typeof ACTIONS)[number])) {
    return { ok: false, error: "Invalid review action." };
  }

  const { data: proof, error: proofError } = await admin
    .from("payment_proofs")
    .select("id, user_id, profile_id, status, category")
    .eq("id", proofId)
    .maybeSingle();

  if (proofError || !proof) {
    return { ok: false, error: proofError?.message ?? "Payment proof not found." };
  }

  if (action === "approved") {
    if (proof.status === "approved") {
      return { ok: false, error: "This proof has already been approved." };
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      return { ok: false, error: "Enter an amount greater than zero." };
    }
    if (!proof.profile_id) {
      return { ok: false, error: "This proof is not linked to a driver." };
    }

    const formData = new FormData();
    formData.append("driver_id", String(proof.profile_id));
    formData.append("type", "fuel_repayment");
    formData.append("amount", String(amount));
    formData.append("skip_notification", "true");

    const logged = await logTransaction(formData);
    if (!logged.ok) {
      return {
        ok: false,
        error: logged.error ?? logged.warning ?? "Could not log the repayment.",
      };
    }
  }

  if (action === "rejected" && !notes) {
    return { ok: false, error: "A rejection reason is required." };
  }

  const { error } = await admin
    .from("payment_proofs")
    .update({
      status: action,
      reviewer_notes: notes,
      reviewed_at: new Date().toISOString(),
      reviewed_by: adminProfile.id,
      updated_at: new Date().toISOString(),
    })
    .eq("id", proofId);
  if (error) return { ok: false, error: error.message };

  const driverUserId = proof.user_id ? String(proof.user_id) : null;
  if (driverUserId) {
    if (action === "approved") {
      await notifyUser(driverUserId, {
        title: "Payment approved",
        body: `Your payment of R${amount.toFixed(2)} has been approved and credited to your account.`,
        link: "/dashboard/client",
        type: "payment_proof",
      });
    } else if (action === "rejected") {
      await notifyUser(driverUserId, {
        title: "Payment proof rejected",
        body: notes ?? "Your proof of payment was rejected.",
        link: "/dashboard/client/support",
        type: "payment_proof",
      });
    } else {
      await notifyUser(driverUserId, {
        title: "Payment proof under review",
        body: notes ?? "Your proof of payment is being reviewed by our team.",
        link: "/dashboard/client/support",
        type: "payment_proof",
      });
    }
  }

  revalidatePath("/dashboard/admin/payments");
  revalidatePath("/dashboard/admin/transactions");
  revalidatePath("/dashboard/admin");
  revalidatePath("/dashboard/admin/drivers");

  return { ok: true };
}
