import { Link } from "react-router-dom";
import type { ComparisonRow } from "../../types/compensation";
import { formatAmount, formatFull } from "../../utils/currency";

type MetricKey = "base" | "bonus" | "equity" | "totalCompensation";

const METRICS: { key: MetricKey; label: string; strong?: boolean }[] = [
  { key: "base", label: "Base" },
  { key: "bonus", label: "Bonus" },
  { key: "equity", label: "Equity" },
  { key: "totalCompensation", label: "Total", strong: true },
];

export function ComparisonTable({ rows }: { rows: ComparisonRow[] }) {
  const minWidth = 140 + rows.length * 130;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[13px]" style={{ minWidth }}>
        <thead>
          <tr className="border-b border-line">
            <th scope="col" className="py-2.5 pr-4 text-left text-xs font-normal text-muted">
              Component
            </th>
            {rows.map((r) => (
              <th scope="col" key={r.companyId} className="px-3 py-2.5 text-right last:pr-0">
                <Link
                  to={`/company/${r.companyId}`}
                  title="View company benchmarks"
                  className="text-[13px] font-medium text-ink hover:text-accent"
                >
                  {r.companyName}
                </Link>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {METRICS.map((m) => {
            const max = Math.max(...rows.map((r) => r[m.key]));
            return (
              <tr key={m.key} className={m.strong ? "border-t border-line" : "border-b border-line/60"}>
                <th
                  scope="row"
                  className={`py-3 pr-4 text-left font-normal ${
                    m.strong ? "font-medium text-ink" : "text-muted"
                  }`}
                >
                  {m.label}
                </th>
                {rows.map((r) => {
                  const isTop = max > 0 && r[m.key] === max;
                  return (
                    <td
                      key={r.companyId}
                      className={`fig whitespace-nowrap px-3 py-3 text-right last:pr-0 ${
                        isTop ? "bg-accent/5" : ""
                      } ${m.strong ? "font-semibold text-ink" : "text-body"}`}
                      title={r[m.key] > 0 ? formatFull(r[m.key]) : undefined}
                    >
                      <span className="inline-flex items-center justify-end gap-1.5">
                        {isTop && (
                          <span
                            className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent"
                            title="Highest in this row"
                          />
                        )}
                        {formatAmount(r[m.key])}
                      </span>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}