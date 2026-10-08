import Link from "next/link";
import { AlertTriangle } from "lucide-react";

export function InactiveAccountBanner() {
  return (
    <div className="rounded-2xl border border-error/40 bg-error/10 p-5 mb-6">
      <div className="flex items-start gap-3">
        <span className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-error/15 text-error shrink-0">
          <AlertTriangle size={22} />
        </span>
        <div className="flex-1">
          <h2 className="font-bold text-error tracking-wide">
            ACCOUNT INACTIVE — PAYMENT REQUIRED
          </h2>
          <p className="text-sm text-textdark/70 mt-1">
            You have an outstanding fuel balance. Fuel credit is paused until it
            is settled. Make a payment or arrange one with our team to
            reactivate your account.
          </p>
          <Link
            href="/dashboard/client/support"
            className="mt-3 inline-flex items-center justify-center rounded-lg bg-error text-white font-semibold py-2.5 px-5 hover:bg-error/90"
          >
            Arrange payment
          </Link>
        </div>
      </div>
    </div>
  );
}
