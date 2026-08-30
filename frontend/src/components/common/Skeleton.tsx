export function TableSkeleton({ rows = 8, cols = 8 }: { rows?: number; cols?: number }) {
  return (
    <div className="px-4 py-1" aria-hidden="true">
      {Array.from({ length: rows }).map((_, r) => (
        <div
          key={r}
          className="grid gap-4 border-b border-line/50 py-3.5 last:border-0"
          style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: cols }).map((_, c) => (
            <div
              key={c}
              className="h-2.5 animate-pulse rounded bg-line/70"
              style={{ width: `${56 + ((r * 13 + c * 7) % 36)}%` }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}