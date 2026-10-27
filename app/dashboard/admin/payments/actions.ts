"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { notifyUser } from "@/lib/notifications";

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

const reviewPaymentProofSchema = z.object({
  proofId: z.string().uuid(),
  action: z.enum(["approved", "rejected", "disputed"]),
  amount: z.number().positive().finite().optional(),
  notes: z.string().trim().max(2000).optional(),
});

export async function reviewPaymentProof(
  input: ReviewPaymentProofInput
): Promise<ReviewPaymentProofResult> {
  const adminProfile = await requireAdmin();
  const admin = createAdminClient();

  const parsed = reviewPaymentProofSchema.safeParse({
    proofId: String(input.proofId ?? "").trim(),
    action: String(input.action ?? "").trim(),
    amount:
      input.action === "approved" ? Number(input.amount ?? 0) : undefined,
    notes: input.notes?.trim() ? input.notes.trim() : undefined,
  });

  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid review action.",
    };
  }

  const { proofId, action, notes = null, amount = 0 } = parsed.data;

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
  }

  if (action === "rejected" && !notes) {
    return { ok: false, error: "A rejection reason is required." };
  }

  const { data: reviewData, error } = await admin.rpc(
    "review_payment_proof",
    {
      p_proof_id: proofId,
      p_admin_profile_id: adminProfile.id,
      p_action: action,
      p_amount: action === "approved" ? amount : null,
      p_notes: notes,
    }
  );

  if (error) return { ok: false, error: error.message };

  const reviewResult = reviewData as {
    ok?: boolean;
    error?: string;
  } | null;

  if (!reviewResult?.ok) {
    return {
      ok: false,
      error: reviewResult?.error ?? "Could not review the payment proof.",
    };
  }

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
  revalidatePath("/dashboard/client");
  revalidatePath("/dashboard/client/finances");
  revalidatePath("/dashboard/client/support");

  return { ok: true };
}
