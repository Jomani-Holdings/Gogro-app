"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { saveReward } from "@/app/dashboard/admin/rewards/actions";
import { MAX_REWARD_IMAGE_SIZE, mediaUrl } from "@/lib/media";
import {
  MEMBERSHIP_TIERS,
  POINT_REWARD_TYPES,
  REWARD_AUDIENCES,
  REWARD_CATEGORIES,
  type PointRewardType,
  type Reward,
} from "@/lib/data/types";

const inputClass =
  "w-full rounded-lg border border-grey/60 bg-white px-4 py-3 text-textdark placeholder:text-textdark/40 focus:outline-none focus:ring-2 focus:ring-orange/60";
const labelClass = "block text-sm font-semibold text-textdark mb-1.5";
const helpClass = "text-xs text-textdark/50 mt-1";

type GarageOption = { id: string; name: string };

function toLocalInput(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function RewardForm({
  reward,
  garages,
  isNew,
}: {
  reward: Reward | null;
  garages: GarageOption[];
  isNew: boolean;
}) {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const teaserInputRef = useRef<HTMLInputElement>(null);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [teaserFile, setTeaserFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [status, setStatus] = useState(reward?.status ?? "draft");
  const [category, setCategory] = useState(reward?.reward_category ?? "perk");
  const [teaserTitle, setTeaserTitle] = useState(reward?.teaser_title ?? "");
  const [teaserDescription, setTeaserDescription] = useState(
    reward?.teaser_description ?? ""
  );
  const [title, setTitle] = useState(reward?.title ?? "");
  const [description, setDescription] = useState(reward?.description ?? "");
  const [audience, setAudience] = useState(reward?.audience ?? "all_drivers");
  const [garageId, setGarageId] = useState(reward?.garage_id ?? "");
  const [membershipTier, setMembershipTier] = useState(
    reward?.membership_tier ?? ""
  );
  const [valueAmount, setValueAmount] = useState(
    reward?.value_amount === null || reward?.value_amount === undefined
      ? ""
      : String(reward.value_amount)
  );
  const [pointCost, setPointCost] = useState(
    reward?.point_cost === null || reward?.point_cost === undefined
      ? ""
      : String(reward.point_cost)
  );
  const [pointRewardType, setPointRewardType] = useState<PointRewardType | "">(
    reward?.point_reward_type ?? ""
  );
  const [maxClaims, setMaxClaims] = useState(
    reward?.max_claims === null || reward?.max_claims === undefined
      ? ""
      : String(reward.max_claims)
  );
  const [perDriverLimit, setPerDriverLimit] = useState(
    String(reward?.per_driver_limit ?? 1)
  );
  const [teaserAt, setTeaserAt] = useState(toLocalInput(reward?.teaser_at ?? null));
  const [publishAt, setPublishAt] = useState(
    toLocalInput(reward?.publish_at ?? null)
  );
  const [expiresAt, setExpiresAt] = useState(
    toLocalInput(reward?.expires_at ?? null)
  );
  const [sortOrder, setSortOrder] = useState(String(reward?.sort_order ?? 0));

  const imagePreview = imageFile
    ? URL.createObjectURL(imageFile)
    : reward?.image_path
      ? mediaUrl(reward.image_path)
      : null;
  const teaserPreview = teaserFile
    ? URL.createObjectURL(teaserFile)
    : reward?.teaser_image_path
      ? mediaUrl(reward.teaser_image_path)
      : null;

  function validateFile(
    selected: File | null,
    input: HTMLInputElement | null
  ): boolean {
    if (!selected) return true;
    if (selected.size > MAX_REWARD_IMAGE_SIZE) {
      setFileError("Image is larger than the 5MB limit.");
      if (input) input.value = "";
      return false;
    }
    if (!selected.type.startsWith("image/")) {
      setFileError("Please choose an image file.");
      if (input) input.value = "";
      return false;
    }
    return true;
  }

  function onImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    setFileError(null);
    const selected = event.target.files?.[0] ?? null;
    setImageFile(validateFile(selected, imageInputRef.current) ? selected : null);
  }

  function onTeaserChange(event: React.ChangeEvent<HTMLInputElement>) {
    setFileError(null);
    const selected = event.target.files?.[0] ?? null;
    setTeaserFile(
      validateFile(selected, teaserInputRef.current) ? selected : null
    );
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const form = event.currentTarget;
    const formData = new FormData(form);

    formData.set("id", isNew ? "new" : reward?.id ?? "new");
    formData.set("status", status);
    formData.set("reward_category", category);
    formData.set("audience", audience);
    formData.set("garage_id", garageId);
    formData.set("membership_tier", membershipTier);
    formData.set("value_amount", valueAmount);
    formData.set("point_cost", pointCost);
    formData.set("point_reward_type", pointRewardType);
    formData.set("max_claims", maxClaims);
    formData.set("per_driver_limit", perDriverLimit);
    formData.set("sort_order", sortOrder);
    formData.set("teaser_at", teaserAt);
    formData.set("publish_at", publishAt);
    formData.set("expires_at", expiresAt);

    for (const key of ["teaser_at", "publish_at", "expires_at"]) {
      const raw = formData.get(key);
      if (typeof raw === "string" && raw.trim()) {
        const date = new Date(raw);
        if (!Number.isNaN(date.getTime())) {
          formData.set(key, date.toISOString());
        }
      }
    }

    if (reward?.image_path) {
      formData.append("existing_image_path", reward.image_path);
    }
    if (reward?.teaser_image_path) {
      formData.append("existing_teaser_image_path", reward.teaser_image_path);
    }

    try {
      await saveReward(formData);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="max-w-4xl space-y-8">
      {error ? (
        <p className="rounded-lg bg-error/10 border border-error/30 px-4 py-3 text-sm text-error">
          {error}
        </p>
      ) : null}

      <section className="bg-white border border-grey/40 rounded-2xl p-6 space-y-5">
        <div>
          <h2 className="text-lg font-semibold text-textdark">Teaser</h2>
          <p className="text-sm text-textdark/60 mt-1">
            This is all a driver sees before the reveal. Keep it vague.
          </p>
        </div>

        <div>
          <label htmlFor="teaser_title" className={labelClass}>
            Teaser title
          </label>
          <input
            id="teaser_title"
            name="teaser_title"
            type="text"
            required
            value={teaserTitle}
            onChange={(event) => setTeaserTitle(event.target.value)}
            placeholder="A Sweet Surprise at Astron Marlborough"
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="teaser_description" className={labelClass}>
            Teaser description
          </label>
          <textarea
            id="teaser_description"
            name="teaser_description"
            rows={3}
            value={teaserDescription}
            onChange={(event) => setTeaserDescription(event.target.value)}
            placeholder="Something special is dropping soon. Keep an eye on the clock…"
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="teaser_image" className={labelClass}>
            Teaser image (optional — falls back to the mystery graphic)
          </label>
          <input
            ref={teaserInputRef}
            id="teaser_image"
            name="teaser_image"
            type="file"
            accept="image/*"
            onChange={onTeaserChange}
            className="block w-full text-sm text-textdark file:mr-4 file:rounded-lg file:border-0 file:bg-navy file:px-4 file:py-3 file:text-sm file:font-semibold file:text-white hover:file:bg-navy/90"
          />
          {teaserPreview ? (
            <div className="relative mt-4 h-40 w-64 overflow-hidden rounded-xl border border-grey/40 bg-offwhite">
              <Image
                src={teaserPreview}
                alt="Teaser preview"
                fill
                unoptimized
                className="object-cover"
                sizes="256px"
              />
            </div>
          ) : null}
        </div>
      </section>

      <section className="bg-white border border-grey/40 rounded-2xl p-6 space-y-5">
        <div>
          <h2 className="text-lg font-semibold text-textdark">The reveal</h2>
          <p className="text-sm text-textdark/60 mt-1">
            Hidden from drivers until the publish time. Never sent to the
            browser early.
          </p>
        </div>

        <div>
          <label htmlFor="title" className={labelClass}>
            Reward title
          </label>
          <input
            id="title"
            name="title"
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Free 500ml Coke"
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="description" className={labelClass}>
            Reward description
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Grab a free 500ml Coke at the counter. Show your live voucher."
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="image" className={labelClass}>
            Reward image (optional)
          </label>
          <input
            ref={imageInputRef}
            id="image"
            name="image"
            type="file"
            accept="image/*"
            onChange={onImageChange}
            className="block w-full text-sm text-textdark file:mr-4 file:rounded-lg file:border-0 file:bg-navy file:px-4 file:py-3 file:text-sm file:font-semibold file:text-white hover:file:bg-navy/90"
          />
          {imagePreview ? (
            <div className="relative mt-4 h-40 w-64 overflow-hidden rounded-xl border border-grey/40 bg-offwhite">
              <Image
                src={imagePreview}
                alt="Reward preview"
                fill
                unoptimized
                className="object-cover"
                sizes="256px"
              />
            </div>
          ) : null}
        </div>
        {fileError ? <p className="text-sm text-error">{fileError}</p> : null}
      </section>

      <section className="bg-white border border-grey/40 rounded-2xl p-6 space-y-5">
        <h2 className="text-lg font-semibold text-textdark">Targeting</h2>

        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <label htmlFor="reward_category" className={labelClass}>
              Reward category
            </label>
            <select
              id="reward_category"
              value={category}
              onChange={(event) =>
                setCategory(event.target.value as typeof category)
              }
              className={inputClass}
            >
              {REWARD_CATEGORIES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="audience" className={labelClass}>
              Audience
            </label>
            <select
              id="audience"
              value={audience}
              onChange={(event) =>
                setAudience(event.target.value as typeof audience)
              }
              className={inputClass}
            >
              {REWARD_AUDIENCES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {audience === "garage_specific" ? (
          <div>
            <label htmlFor="garage_id" className={labelClass}>
              Garage
            </label>
            <select
              id="garage_id"
              value={garageId}
              onChange={(event) => setGarageId(event.target.value)}
              className={inputClass}
            >
              <option value="">Select a garage</option>
              {garages.map((garage) => (
                <option key={garage.id} value={garage.id}>
                  {garage.name}
                </option>
              ))}
            </select>
          </div>
        ) : null}

        {audience === "tier_specific" ? (
          <div>
            <label htmlFor="membership_tier" className={labelClass}>
              Membership tier
            </label>
            <select
              id="membership_tier"
              value={membershipTier}
              onChange={(event) => setMembershipTier(event.target.value)}
              className={inputClass}
            >
              <option value="">Select a tier</option>
              {MEMBERSHIP_TIERS.map((tier) => (
                <option key={tier.value} value={tier.value}>
                  {tier.label}
                </option>
              ))}
            </select>
          </div>
        ) : null}

        <div className="grid sm:grid-cols-3 gap-5">
          <div>
            <label htmlFor="value_amount" className={labelClass}>
              Value (R)
            </label>
            <input
              id="value_amount"
              type="number"
              min={0}
              step="0.01"
              value={valueAmount}
              onChange={(event) => setValueAmount(event.target.value)}
              className={inputClass}
              placeholder="e.g. 400"
            />
            <p className={helpClass}>Optional. Shown on programme rewards.</p>
          </div>
          <div>
            <label htmlFor="max_claims" className={labelClass}>
              Max claims
            </label>
            <input
              id="max_claims"
              type="number"
              min={0}
              value={maxClaims}
              onChange={(event) => setMaxClaims(event.target.value)}
              className={inputClass}
              placeholder="Unlimited"
            />
            <p className={helpClass}>Leave empty for unlimited inventory.</p>
          </div>
          <div>
            <label htmlFor="per_driver_limit" className={labelClass}>
              Per driver limit
            </label>
            <input
              id="per_driver_limit"
              type="number"
              min={0}
              value={perDriverLimit}
              onChange={(event) => setPerDriverLimit(event.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <label htmlFor="point_cost" className={labelClass}>
              Point cost
            </label>
            <input
              id="point_cost"
              type="number"
              min={0}
              step={1}
              value={pointCost}
              onChange={(event) => setPointCost(event.target.value)}
              className={inputClass}
              placeholder="e.g. 500"
            />
            <p className={helpClass}>
              Leave empty for a campaign reward. 10 points = R1.
            </p>
          </div>
          <div>
            <label htmlFor="point_reward_type" className={labelClass}>
              Point reward type
            </label>
            <select
              id="point_reward_type"
              value={pointRewardType}
              onChange={(event) =>
                setPointRewardType(event.target.value as PointRewardType | "")
              }
              className={inputClass}
            >
              <option value="">Not a point reward</option>
              {POINT_REWARD_TYPES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className="bg-white border border-grey/40 rounded-2xl p-6 space-y-5">
        <div>
          <h2 className="text-lg font-semibold text-textdark">Scheduling</h2>
          <p className="text-sm text-textdark/60 mt-1">
            The card flips from teaser to reveal automatically at the publish
            time. No cron job needed.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-5">
          <div>
            <label htmlFor="teaser_at" className={labelClass}>
              Teaser starts
            </label>
            <input
              id="teaser_at"
              type="datetime-local"
              value={teaserAt}
              onChange={(event) => setTeaserAt(event.target.value)}
              className={inputClass}
            />
            <p className={helpClass}>Optional. Before this, the card is hidden.</p>
          </div>
          <div>
            <label htmlFor="publish_at" className={labelClass}>
              Publish / reveal
            </label>
            <input
              id="publish_at"
              type="datetime-local"
              required
              value={publishAt}
              onChange={(event) => setPublishAt(event.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="expires_at" className={labelClass}>
              Expires
            </label>
            <input
              id="expires_at"
              type="datetime-local"
              value={expiresAt}
              onChange={(event) => setExpiresAt(event.target.value)}
              className={inputClass}
            />
            <p className={helpClass}>Optional. Hides the reward afterwards.</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <label htmlFor="status" className={labelClass}>
              Status
            </label>
            <select
              id="status"
              value={status}
              onChange={(event) =>
                setStatus(event.target.value as typeof status)
              }
              className={inputClass}
            >
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <div>
            <label htmlFor="sort_order" className={labelClass}>
              Sort order
            </label>
            <input
              id="sort_order"
              type="number"
              value={sortOrder}
              onChange={(event) => setSortOrder(event.target.value)}
              className={inputClass}
            />
          </div>
        </div>
      </section>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center justify-center rounded-lg bg-orange text-white font-semibold py-3 px-6 transition-colors hover:bg-orange/90 disabled:opacity-60"
        >
          {submitting ? "Saving…" : isNew ? "Create reward" : "Save changes"}
        </button>
        <Link
          href="/dashboard/admin/rewards"
          className="inline-flex items-center justify-center rounded-lg border border-navy text-navy font-semibold py-3 px-6 transition-colors hover:bg-navy/5"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
