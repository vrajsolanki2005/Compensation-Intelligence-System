import { useMemo, useState } from "react";
import type { Company } from "../../types/compensation";

interface CompanySelectorProps {
  companies: Company[];
  selected: number[];
  onToggle: (id: number) => void;
  onClear: () => void;
}

function SearchIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.7" />
      <path d="m16 16 4.5 4.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

export function CompanySelector({ companies, selected, onToggle, onClear }: CompanySelectorProps) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? companies.filter((c) => c.name.toLowerCase().includes(q)) : companies;
  }, [companies, query]);

  return (
    <div>
      <div className="flex items-baseline justify-between gap-4 border-b border-line pb-2.5">
        <h2 className="text-[13px] font-medium text-ink">
          Companies
          {selected.length > 0 ? (
            <span className="fig ml-2 text-xs font-normal text-muted">{selected.length} selected</span>
          ) : null}
        </h2>
        {selected.length > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="text-xs text-muted hover:text-accent"
          >
            Clear
          </button>
        )}
      </div>

      <div className="relative mt-4">
        <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-faint">
          <SearchIcon />
        </span>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search companies"
          aria-label="Search companies"
          className="h-9 w-full max-w-xs rounded border border-line bg-surface pl-8 pr-3 text-sm placeholder:text-faint hover:border-faint focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/15"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="mt-3 text-sm text-muted">No companies match “{query.trim()}”.</p>
      ) : (
        <ul className="mt-3 grid max-h-72 grid-cols-2 gap-1.5 overflow-y-auto sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((c) => {
            const isSelected = selected.includes(c.id);
            return (
              <li key={c.id}>
                <label
                  className={`flex h-10 cursor-pointer items-center gap-2.5 rounded border px-3 text-sm transition-colors ${
                    isSelected
                      ? "border-accent/40 bg-accent/10 text-accent"
                      : "border-line text-ink hover:border-faint"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggle(c.id)}
                    className="h-3.5 w-3.5 cursor-pointer accent-[#1D5C41]"
                  />
                  <span className="truncate" title={c.name}>
                    {c.name}
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
