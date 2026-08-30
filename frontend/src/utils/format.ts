export function formatExperience(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) {
    return "—";
  }

  return Number.isInteger(value)
    ? `${value} yr`
    : `${value.toFixed(1)} yr`;
}

export function formatCount(n: number): string {
  return n.toLocaleString("en-IN");
}

export function formatRange(page: number, limit: number, total: number): string {
  if (total === 0) return "0 results";
  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);
  return `${start}–${end} of ${formatCount(total)}`;
}