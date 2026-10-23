export function formatMoney(
  value: number | null | undefined,
  fractionDigits = 0
): string {
  if (value === null || value === undefined) return "—";
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-ZA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-ZA", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// 10 reward points = R1. Displayed as a whole Rand value.
export function pointsToRand(points: number | null | undefined): number {
  return Math.round((points ?? 0) / 10);
}

export function formatPoints(points: number | null | undefined): string {
  return `${new Intl.NumberFormat("en-US").format(points ?? 0)} pts`;
}

// Balances below zero are driver credit, not debt. Render them positively.
export function formatBalance(
  value: number | null | undefined,
  fractionDigits = 2
): { text: string; isCredit: boolean } {
  const amount = value ?? 0;
  return {
    text: formatMoney(Math.abs(amount), fractionDigits),
    isCredit: amount < 0,
  };
}