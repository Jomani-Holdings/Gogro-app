import { formatDateTime, formatPoints } from "@/lib/utils";
import type { ClientReferral } from "@/lib/data/types";

function initials(name: string | null, email: string | null): string {
  const source = name ?? email ?? "?";
  const parts = source.split(/[\s@]+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "?";
  const second = parts[1]?.[0] ?? "";
  return `${first}${second}`.toUpperCase();
}

function statusInfo(status: string): { label: string; className: string } {
  if (status === "qualified" || status === "rewarded") {
    return { label: "On Time", className: "bg-success/10 text-success" };
  }
  return { label: "Pending", className: "bg-yellow/20 text-textdark" };
}

export function ClientReferralsTable({
  referrals,
}: {
  referrals: ClientReferral[];
}) {
  if (referrals.length === 0) {
    return (
      <p className="text-sm text-textdark/50 py-6 text-center">
        No referrals yet. Share your code below to get started.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-grey/40 text-left text-textdark/60">
            <th className="px-3 py-2 font-medium">Driver Name</th>
            <th className="px-3 py-2 font-medium">Status</th>
            <th className="px-3 py-2 font-medium">Weeks Paid</th>
            <th className="px-3 py-2 font-medium">Points Earned</th>
            <th className="hidden md:table-cell px-3 py-2 font-medium">
              Last Payment
            </th>
          </tr>
        </thead>
        <tbody>
          {referrals.map((referral) => {
            const status = statusInfo(referral.status);
            const displayName =
              referral.referred_name ??
              referral.referred_email ??
              "Invited driver";

            return (
              <tr
                key={referral.id}
                className="border-b border-grey/20 last:border-0"
              >
                <td className="px-3 py-3">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy/10 text-xs font-bold text-navy">
                      {initials(referral.referred_name, referral.referred_email)}
                    </span>
                    <div className="min-w-0">
                      <p className="font-medium text-textdark truncate">
                        {displayName}
                      </p>
                      <p className="text-xs text-textdark/50">
                        {referral.referred_id
                          ? `ID ${referral.referred_id.slice(0, 8).toUpperCase()}`
                          : "Invite pending"}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-3">
                  <span
                    className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${status.className}`}
                  >
                    {status.label}
                  </span>
                </td>
                <td className="px-3 py-3 text-textdark/70">
                  {referral.weeks_paid}
                </td>
                <td className="px-3 py-3 text-textdark/70">
                  {formatPoints(referral.points_earned)}
                </td>
                <td className="hidden md:table-cell px-3 py-3 text-textdark/60">
                  {referral.last_payment_at
                    ? formatDateTime(referral.last_payment_at)
                    : "—"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
