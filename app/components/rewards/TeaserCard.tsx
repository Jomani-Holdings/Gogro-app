"use client";

import { useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Gift, MapPin } from "lucide-react";
import { mediaUrl } from "@/lib/media";
import type { ClientReward } from "@/lib/data/types";
import { CountdownTimer } from "./CountdownTimer";
import { MysteryPerkGraphic } from "./MysteryPerkGraphic";

export function TeaserCard({ reward }: { reward: ClientReward }) {
  const router = useRouter();

  const handleComplete = useCallback(() => {
    // Re-fetch the server payload so the newly published data is revealed.
    router.refresh();
  }, [router]);

  const image = reward.teaser_image_path
    ? mediaUrl(reward.teaser_image_path)
    : null;

  return (
    <article className="bg-white border border-grey/40 rounded-2xl overflow-hidden shadow-sm">
      <div className="relative aspect-[4/3]">
        {image ? (
          <Image
            src={image}
            alt={reward.teaser_title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <MysteryPerkGraphic />
        )}
        <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-navy shadow">
          <Gift size={13} />
          Coming soon
        </span>
      </div>

      <div className="p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-orange">
          Teaser
        </p>
        <h3 className="text-lg font-bold text-textdark mt-1">
          {reward.teaser_title}
        </h3>
        {reward.teaser_description ? (
          <p className="text-sm text-textdark/60 mt-2">
            {reward.teaser_description}
          </p>
        ) : null}

        <div className="mt-4 rounded-xl border border-navy/10 bg-navy/[0.03] px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-textdark/50">
            Reveals in
          </p>
          <CountdownTimer
            target={reward.publish_at}
            onComplete={handleComplete}
            className="text-2xl font-bold text-navy"
          />
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
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
      </div>
    </article>
  );
}
