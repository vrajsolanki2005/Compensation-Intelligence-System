import type { ComparisonRow } from "../../types/compensation";
import { formatCompact, formatFull } from "../../utils/currency";

export function ComparisonChart({ rows }: { rows: ComparisonRow[] }) {
  const max = Math.max(...rows.map((r) => r.totalCompensation), 1);
  const sorted = [...rows].sort((a, b) => b.totalCompensation - a.totalCompensation);

  return (
    <div className="space-y-3">
      {sorted.map((r) => (
        <div key={r.companyId} className="flex items-center gap-3 min-w-[360px]">
          <div className="w-28 shrink-0 truncate text-[13px] sm:w-36" title={r.companyName}>
            {r.companyName}
          </div>
          <div className="h-4 min-w-[100px] flex-1 overflow-hidden rounded-sm bg-line/50">
            <div
              className="h-full rounded-sm bg-accent"
              style={{ width: `${Math.max(2, (r.totalCompensation / max) * 100)}%` }}
            />
          </div>
          <div
            className="fig w-[68px] shrink-0 text-right text-[13px] text-ink"
            title={formatFull(r.totalCompensation)}
          >
            {formatCompact(r.totalCompensation)}
          </div>
        </div>
      ))}
    </div>
  );
}