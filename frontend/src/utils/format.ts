export function formatExperience(years: number | null): string {
  if (years === null) return "—";
  return Number.isInteger(years) ? `${years} yr` : `${years.toFixed(1)} yr`;
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