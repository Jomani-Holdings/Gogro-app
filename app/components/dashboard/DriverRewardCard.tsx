"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Gift, MapPin, MessageCircle, ShoppingBag } from "lucide-react";
import { mediaUrl } from "@/lib/media";
import { formatMoney, formatPoints } from "@/lib/utils";
import type { ClientReward } from "@/lib/data/types";
import { getWhatsAppLink } from "@/app/lib/site-config";
import {
  claimFreeReward,
  redeemPoints,
} from "@/app/dashboard/client/rewards/actions";

export function DriverRewardCard({
  reward,
  claimedCount,
  driverName,
  driverId,
  latestClaim,
}: {
  reward: ClientReward;
  claimedCount: number;
  driverName: string;
  driverId: string;
  latestClaim?: { id: string; status: string } | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [localClaim, setLocalClaim] = useState<{
    id: string;
    status: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const imagePath = reward.image_path ?? reward.teaser_image_path;
  const image = imagePath ? mediaUrl(imagePath) : null;
  const title = reward.title ?? reward.teaser_title;
  const isPointReward = (reward.point_cost ?? 0) > 0;
  const limitReached =
    reward.per_driver_limit > 0 && claimedCount >= reward.per_driver_limit;

  const claim =
    localClaim ??
    (latestClaim ? { id: latestClaim.id, status: latestClaim.status } : null);
  const pendingClaim = claim?.status === "pending" ? claim : null;
  const redeemedClaim = claim?.status === "redeemed" ? claim : null;

  const whatsAppMessage = claim
    ? `Hi Go Gro Mobility, I'd like to redeem my reward: ${title}${
        isPointReward
          ? ` (${formatPoints(reward.point_cost ?? 0)})`
          : " (free reward)"
      }. Driver: ${driverName} (ID: ${driverId}). Claim ref: ${claim.id}.`
    : "";

  function handleClaim() {
    setError(null);
    startTransition(async () => {
      const result = isPointReward
        ? await redeemPoints(reward.id)
        : await claimFreeReward(reward.id);

      if (!result.ok) {
        setError(result.error ?? "Something went wrong.");
        return;
      }

      if (result.claim_id) {
        setLocalClaim({
          id: result.claim_id,
          status: result.claim_status ?? "pending",
        });
      }

      router.refresh();
    });
  }

  return (
    <article className="bg-white border border-grey/40 rounded-2xl overflow-hidden shadow-sm flex flex-col">
      <div className="relative aspect-[4/3] bg-offwhite">
        {image ? (
          <Image
            src={image}
            alt={title}
            fill
            unoptimized
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-navy/40">
            <Gift size={40} />
          </div>
        )}
        <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-success px-3 py-1 text-xs font-semibold text-white shadow">
          <Gift size={13} />
          Available now
        </span>
      </div>

      <div className="p-5 flex flex-col flex-1">
        <h3 className="text-lg font-bold text-textdark">{title}</h3>
        {reward.description ? (
          <p className="text-sm text-textdark/60 mt-2">{reward.description}</p>
        ) : null}

        <div className="flex flex-wrap gap-2 mt-4">
          {reward.point_cost && reward.point_cost > 0 ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-navy/10 px-2.5 py-1 text-xs font-semibold text-navy">
              <ShoppingBag size={12} />
              {formatPoints(reward.point_cost)}
            </span>
          ) : null}
          {reward.value_amount ? (
            <span className="inline-flex items-center rounded-full bg-success/10 px-2.5 py-1 text-xs font-semibold text-success">
              Worth {formatMoney(reward.value_amount, 2)}
            </span>
          ) : null}
          {reward.garage_name ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-offwhite px-2.5 py-1 text-xs text-textdark/60">
              <MapPin size={12} />
              {reward.garage_name}
            </span>
          ) : null}
          {reward.membership_tier ? (
            <span className="inline-flex items-center rounded-full bg-yellow/20 px-2.5 py-1 text-xs font-semibold text-textdark capitalize">
              {reward.membership_tier} members
            </span>
          ) : null}
        </div>

        <div className="mt-auto pt-5">
          {pendingClaim ? (
            <>
              <a
                href={getWhatsAppLink(whatsAppMessage)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-success px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-success/90"
              >
                <MessageCircle size={16} />
                Send WhatsApp to redeem
              </a>
              <p className="mt-2 text-xs text-textdark/60">
                Claim pending — send the message so our team can complete your
                reward.
              </p>
            </>
          ) : redeemedClaim && limitReached ? (
            <p className="text-sm font-semibold text-success">
              Redeemed — enjoy your reward!
            </p>
          ) : (
            <button
              type="button"
              onClick={handleClaim}
              disabled={pending || limitReached}
              className="inline-flex w-full items-center justify-center rounded-lg bg-orange px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {limitReached
                ? "Already claimed"
                : pending
                  ? "Processing…"
                  : isPointReward
                    ? `Redeem ${formatPoints(reward.point_cost)}`
                    : "Claim reward"}
            </button>
          )}

          {error ? (
            <p className="mt-2 text-xs font-semibold text-error">{error}</p>
          ) : null}
        </div>
      </div>
    </article>
  );
}
