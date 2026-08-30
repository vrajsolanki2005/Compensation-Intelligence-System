import type { CompensationSummary as Summary } from "../../types/compensation";
import { formatCompact } from "../../utils/currency";
import { PercentileBand } from "./PercentileBand";

export function CompensationSummary({ summary }: { summary: Summary }) {
  const p = summary.totalCompensation;

  return (
    <div>
      <p className="text-sm leading-6 text-body">
        The median total compensation is{" "}
        <span className="fig font-medium text-ink">{formatCompact(p.p50)}</span>.
      </p>

      <div className="mt-5 grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-4">
        {(["p25", "p50", "p75", "p90"] as const).map((k) => (
          <div key={k}>
            <div className="text-xs text-muted">{k === "p50" ? "P50 · median" : k.toUpperCase()}</div>
            <div
              className={`fig mt-0.5 ${
                k === "p50" ? "text-2xl font-medium text-accent" : "text-xl text-ink"
              }`}
            >
              {formatCompact(p[k])}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-7">
        <PercentileBand percentiles={p} />
      </div>
    </div>
  );
}