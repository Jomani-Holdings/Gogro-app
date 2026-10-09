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
            ACCOUNT INACTIVE
          </h2>
          <p className="text-sm text-textdark/70 mt-1">
            Your account is currently inactive. Please contact support to learn
            more about why your account was deactivated and how to reactivate
            it.
          </p>
          <Link
            href="/dashboard/client/support?category=account-deactivated&message=My+account+has+been+deactivated.+Please+let+me+know+why+and+how+I+can+reactivate+it."
            className="mt-3 inline-flex items-center justify-center rounded-lg bg-error text-white font-semibold py-2.5 px-5 hover:bg-error/90"
          >
            Contact support
          </Link>
        </div>
      </div>
    </div>
  );
}
