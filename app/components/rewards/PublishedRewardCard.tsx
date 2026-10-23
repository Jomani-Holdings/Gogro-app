import Image from "next/image";
import Link from "next/link";
import { Gift, MapPin } from "lucide-react";
import { mediaUrl } from "@/lib/media";
import { formatMoney } from "@/lib/utils";
import type { ClientReward } from "@/lib/data/types";
import { MysteryPerkGraphic } from "./MysteryPerkGraphic";

export function PublishedRewardCard({ reward }: { reward: ClientReward }) {
  const imagePath = reward.image_path ?? reward.teaser_image_path;
  const image = imagePath ? mediaUrl(imagePath) : null;
  const title = reward.title ?? reward.teaser_title;

  return (
    <article className="bg-white border border-grey/40 rounded-2xl overflow-hidden shadow-sm">
      <div className="relative aspect-[4/3]">
        {image ? (
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <MysteryPerkGraphic />
        )}
        <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-success px-3 py-1 text-xs font-semibold text-white shadow">
          <Gift size={13} />
          Available now
        </span>
      </div>

      <div className="p-5">
        <h3 className="text-lg font-bold text-textdark">{title}</h3>
        {reward.description ? (
          <p className="text-sm text-textdark/60 mt-2">{reward.description}</p>
        ) : null}

        <div className="flex flex-wrap gap-2 mt-4">
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

        <Link
          href="/login"
          className="mt-5 inline-flex w-full items-center justify-center rounded-lg bg-orange px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange/90"
        >
          Log in to claim
        </Link>
      </div>
    </article>
  );
}
