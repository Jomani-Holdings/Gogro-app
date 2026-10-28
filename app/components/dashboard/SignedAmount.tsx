import type { TransactionType } from "@/lib/data/types";
import { formatSignedAmount } from "@/lib/utils";

export function SignedAmount({
  type,
  amount,
  className = "",
}: {
  type: TransactionType | string;
  amount: number;
  className?: string;
}) {
  const signed = formatSignedAmount(type, amount);
  return (
    <span className={`font-semibold ${signed.tone} ${className}`.trim()}>
      {signed.text}
    </span>
  );
}
