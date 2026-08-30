import { formatAmount, formatCompact, formatFull } from "../../utils/currency";

interface CompensationBreakdownProps {
  base: number;
  bonus: number;
  equity: number;
  total: number;
}

export function CompensationBreakdown({ base, bonus, equity, total }: CompensationBreakdownProps) {
  const parts = [
    { label: "Base", value: base, className: "bg-accent" },
    { label: "Bonus", value: bonus, className: "bg-accent/50" },
    { label: "Equity", value: equity, className: "bg-accent/25" },
  ];
  const sum = base + bonus + equity;

  return (
    <div>
      {sum > 0 && (
        <div className="flex h-2.5 max-w-md overflow-hidden rounded-sm bg-line/50">
          {parts
            .filter((p) => p.value > 0)
            .map((p) => (
              <div
                key={p.label}
                className={p.className}
                style={{ width: `${(p.value / sum) * 100}%` }}
                title={`${p.label} ${formatFull(p.value)}`}
              />
            ))}
        </div>
      )}

      <dl className="mt-4 max-w-md text-sm">
        {parts.map((p) => (
          <div key={p.label} className="flex justify-between border-b border-line/70 py-2">
            <dt className="text-muted">
              {p.label}
              {sum > 0 && p.value > 0 ? (
                <span className="fig ml-2 text-xs text-faint">
                  {Math.round((p.value / sum) * 100)}%
                </span>
              ) : null}
            </dt>
            <dd className="fig text-ink">{formatAmount(p.value)}</dd>
          </div>
        ))}
        <div className="flex justify-between py-2.5">
          <dt className="font-medium text-ink">Total</dt>
          <dd className="fig font-medium text-ink" title={formatFull(total)}>
            {formatCompact(total)}
          </dd>
        </div>
      </dl>
    </div>
  );
}