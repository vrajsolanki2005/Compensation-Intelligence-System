import { formatRange } from "../../utils/format";

interface PaginationProps {
  page: number;
  limit: number;
  total: number;
  onPage: (page: number) => void;
}

function pageList(page: number, pageCount: number): (number | "…")[] {
  if (pageCount <= 7) return Array.from({ length: pageCount }, (_, i) => i + 1);
  const pages = new Set(
    [1, pageCount, page - 1, page, page + 1].filter((p) => p >= 1 && p <= pageCount),
  );
  const sorted = [...pages].sort((a, b) => a - b);
  const out: (number | "…")[] = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) out.push("…");
    out.push(p);
  });
  return out;
}

export function Pagination({ page, limit, total, onPage }: PaginationProps) {
  if (total === 0) return null;
  const pageCount = Math.max(1, Math.ceil(total / limit));
  const navBtn =
    "h-7 rounded border border-line px-2.5 text-xs text-muted hover:border-faint hover:text-ink disabled:pointer-events-none disabled:opacity-40";

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line/70 px-4 py-3">
      <p className="text-xs text-muted" aria-live="polite">
        {formatRange(page, limit, total)}
      </p>
      {pageCount > 1 && (
        <nav aria-label="Pagination" className="flex items-center gap-1">
          <button type="button" disabled={page <= 1} onClick={() => onPage(page - 1)} className={navBtn}>
            Previous
          </button>
          {pageList(page, pageCount).map((p, i) =>
            typeof p === "number" ? (
              <button
                key={p}
                type="button"
                aria-current={p === page ? "page" : undefined}
                onClick={() => onPage(p)}
                className={`fig h-7 min-w-[28px] rounded px-1 text-xs ${
                  p === page ? "bg-ink text-paper" : "text-muted hover:bg-paper hover:text-ink"
                }`}
              >
                {p}
              </button>
            ) : (
              <span key={`gap-${i}`} className="px-1 text-xs text-faint">
                …
              </span>
            ),
          )}
          <button
            type="button"
            disabled={page >= pageCount}
            onClick={() => onPage(page + 1)}
            className={navBtn}
          >
            Next
          </button>
        </nav>
      )}
    </div>
  );
}