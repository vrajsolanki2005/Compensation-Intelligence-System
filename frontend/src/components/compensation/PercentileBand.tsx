import type { Percentiles } from "../../types/compensation";
import { formatCompact } from "../../utils/currency";

export function PercentileBand({ percentiles }: { percentiles: Percentiles }) {
  const { p25, p50, p75, p90 } = percentiles;
  const span = Math.max(p90 - p25, 1);
  const pos = (v: number) => Math.min(100, Math.max(0, ((v - p25) / span) * 100));

  const marks = [
    { key: "p25", label: "P25", value: p25, cls: "" },
    { key: "p50", label: "P50", value: p50, cls: "-translate-x-1/2" },
    { key: "p75", label: "P75", value: p75, cls: "-translate-x-1/2" },
    { key: "p90", label: "P90", value: p90, cls: "-translate-x-full" },
  ];

  return (
    <div>
      <div className="relative h-1.5 rounded-full bg-line/60">
        <div
          className="absolute inset-y-0 rounded-full bg-accent/20"
          style={{ left: `${pos(p25)}%`, width: `${pos(p75) - pos(p25)}%` }}
        />
        {marks.map((m) => (
          <div
            key={m.key}
            className="absolute -top-1.5 h-[18px] w-px bg-faint"
            style={{ left: `${pos(m.value)}%` }}
          />
        ))}
        <div
          className="absolute -top-2 h-5 w-0.5 bg-accent"
          style={{ left: `calc(${pos(p50)}% - 1px)` }}
        />
      </div>
      <div className="relative h-10">
        {marks.map((m) => (
          <div key={m.key} className={`absolute top-1 ${m.cls}`} style={{ left: `${pos(m.value)}%` }}>
            <span
              className={`block text-[11px] ${
                m.key === "p50" ? "font-medium text-accent" : "text-muted"
              }`}
            >
              {m.label}
            </span>
            <span className="fig block text-xs text-ink">{formatCompact(m.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}