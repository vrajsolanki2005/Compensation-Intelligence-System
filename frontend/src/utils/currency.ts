function trim(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}

export function formatCompact(value: number): string {
  if (value >= 1e7) return `₹${trim(value / 1e7)}Cr`;
  if (value >= 1e5) return `₹${trim(value / 1e5)}L`;
  if (value >= 1e3) return `₹${trim(value / 1e3)}K`;
  return `₹${trim(value)}`;
}

export function formatFull(value: number): string {
  return `₹${Math.round(value).toLocaleString("en-IN")}`;
}

export function formatCurrency(value: number, compact = true): string {
  return compact ? formatCompact(value) : formatFull(value);
}

/** Zero-valued components read as an em dash; anything positive is compact. */
export function formatAmount(value: number): string {
  return value > 0 ? formatCompact(value) : "—";
}