"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  archiveReward,
  deleteReward,
  duplicateReward,
} from "@/app/dashboard/admin/rewards/actions";
import type { RewardState } from "@/lib/data/types";

export function RewardRowActions({
  id,
  name,
  state,
}: {
  id: string;
  name: string;
  state: RewardState;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function run(action: () => Promise<void>) {
    setError(null);
    startTransition(async () => {
      try {
        await action();
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Action failed.");
      }
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-3">
        <button
          type="button"
          disabled={pending}
          onClick={() => run(() => duplicateReward(id))}
          className="text-navy font-semibold hover:text-orange disabled:opacity-50"
        >
          Duplicate
        </button>

        {state !== "archived" ? (
          <button
            type="button"
            disabled={pending}
            onClick={() => {
              if (!window.confirm(`Archive "${name}"?`)) return;
              run(() => archiveReward(id));
            }}
            className="text-textdark/70 font-semibold hover:text-textdark disabled:opacity-50"
          >
            Archive
          </button>
        ) : null}

        <button
          type="button"
          disabled={pending}
          onClick={() => {
            if (
              !window.confirm(
                `Delete "${name}" permanently? This cannot be undone.`
              )
            ) {
              return;
            }
            run(() => deleteReward(id));
          }}
          className="text-error font-semibold hover:underline disabled:opacity-50"
        >
          Delete
        </button>
      </div>
      {error ? <p className="text-xs text-error">{error}</p> : null}
    </div>
  );
}
