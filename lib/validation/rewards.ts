import { z } from "zod";

const optionalText = z
  .string()
  .trim()
  .optional()
  .nullable()
  .transform((value) => (value && value.length > 0 ? value : null));

export const rewardSchema = z
  .object({
    status: z.enum(["draft", "scheduled", "archived"]),
    reward_category: z.enum([
      "perk",
      "programme_fuel",
      "programme_referral",
      "programme_repair",
    ]),
    teaser_title: z
      .string()
      .trim()
      .min(3, "Teaser title is required (at least 3 characters)"),
    teaser_description: optionalText,
    title: optionalText,
    description: optionalText,
    audience: z.enum(["all_drivers", "garage_specific", "tier_specific"]),
    garage_id: z.string().uuid().optional().nullable(),
    membership_tier: z
      .enum(["standard", "gold", "platinum"])
      .optional()
      .nullable(),
    value_amount: z.number().min(0).optional().nullable(),
    point_cost: z.number().int().min(0).optional().nullable(),
    point_reward_type: z
      .enum(["fuel_credit", "cash_reward", "tyre_voucher", "service_voucher"])
      .optional()
      .nullable(),
    max_claims: z.number().int().min(0).optional().nullable(),
    per_driver_limit: z.number().int().min(0),
    teaser_at: z.string().optional().nullable(),
    publish_at: z.string().min(1, "Publish date is required"),
    expires_at: z.string().optional().nullable(),
    sort_order: z.number().int(),
  })
  .superRefine((data, ctx) => {
      if (data.audience === "garage_specific" && !data.garage_id) {
      ctx.addIssue({
        code: "custom",
        path: ["garage_id"],
        message: "Choose a garage for a garage-specific reward.",
      });
    }

    if (data.audience === "tier_specific" && !data.membership_tier) {
      ctx.addIssue({
        code: "custom",
        path: ["membership_tier"],
        message: "Choose a membership tier for a tier-specific reward.",
      });
    }

    if ((data.point_cost ?? 0) > 0 && !data.point_reward_type) {
      ctx.addIssue({
        code: "custom",
        path: ["point_reward_type"],
        message: "Choose what kind of point reward this is.",
      });
    }

    if (data.point_reward_type && !data.point_cost) {
      ctx.addIssue({
        code: "custom",
        path: ["point_cost"],
        message: "Enter a point cost for this catalog reward.",
      });
    }

    if (data.status === "scheduled") {
      if (!data.title) {
        ctx.addIssue({
          code: "custom",
          path: ["title"],
          message: "Add the reward title before scheduling it.",
        });
      }
      const publish = new Date(data.publish_at);
      if (Number.isNaN(publish.getTime())) {
        ctx.addIssue({
          code: "custom",
          path: ["publish_at"],
          message: "Enter a valid publish date.",
        });
      }
      if (data.teaser_at) {
        const teaser = new Date(data.teaser_at);
        if (!Number.isNaN(teaser.getTime()) && !Number.isNaN(publish.getTime())) {
          if (teaser.getTime() >= publish.getTime()) {
            ctx.addIssue({
              code: "custom",
              path: ["teaser_at"],
              message: "The teaser must start before the reward is published.",
            });
          }
        }
      }
      if (data.expires_at) {
        const expires = new Date(data.expires_at);
        if (!Number.isNaN(expires.getTime()) && !Number.isNaN(publish.getTime())) {
          if (expires.getTime() <= publish.getTime()) {
            ctx.addIssue({
              code: "custom",
              path: ["expires_at"],
              message: "The expiry must be after the publish date.",
            });
          }
        }
      }
    }
  });

export type RewardInput = z.infer<typeof rewardSchema>;
