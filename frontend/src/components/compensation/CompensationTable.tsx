import { Link } from "react-router-dom";
import type { CompensationRecord } from "../../types/compensation";
import { formatAmount, formatFull } from "../../utils/currency";
import { formatExperience } from "../../utils/format";
import { LevelBadge } from "../common/LevelBadge";

interface CompensationTableProps {
  records: CompensationRecord[];
  sort: string;
  order: "asc" | "desc";
  onSort: (field: string) => void;
  showCompany?: boolean;
  showRole?: boolean;
  showLocation?: boolean;
  showExperience?: boolean;
}

const SORTABLE = [
  { field: "base", label: "Base" },
  { field: "bonus", label: "Bonus" },
  { field: "equity", label: "Equity" },
  { field: "totalCompensation", label: "Total" },
  { field: "experience", label: "Experience" },
] as const;

// CompensationTable.tsx
function SortArrow({ active, dir }: { active: boolean; dir?: "asc" | "desc" }) {
  return (
    <span>
      {active && dir === "asc" ? "↑" : active && dir === "desc" ? "↓" : ""}
    </span>
  );
}




export function CompensationTable({
  records,
  sort,
  order,
  onSort,
  showCompany = true,
  showRole = false,
  showLocation = true,
  showExperience = true,
}: CompensationTableProps) {
  const minWidth =
    560 + (showCompany ? 150 : 0) + (showRole ? 140 : 0) + (showLocation ? 120 : 0);
  const cell = "py-2.5 pr-4 text-right fig whitespace-nowrap";

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[13px]" style={{ minWidth }}>
        <thead>
          <tr className="border-b border-line text-xs text-muted">
            {showCompany && (
              <th scope="col" className="px-4 py-2.5 text-left font-normal sm:px-5">
                Company
              </th>
            )}
            {showRole && <th scope="col" className="py-2.5 pr-4 text-left font-normal">Role</th>}
            <th scope="col" className="py-2.5 pr-4 text-left font-normal">Level</th>
            {showLocation && (
              <th scope="col" className="py-2.5 pr-4 text-left font-normal">Location</th>
            )}
            {SORTABLE.filter((c) => c.field !== "experience" || showExperience).map((c) => {
              const active = sort === c.field;
              return (
                <th
                  key={c.field}
                  scope="col"
                  className="py-2.5 pr-4 text-right font-normal"
                  aria-sort={active ? (order === "asc" ? "ascending" : "descending") : "none"}
                >
                  <button
                    type="button"
                    onClick={() => onSort(c.field)}
                    className={`inline-flex items-center gap-1.5 hover:text-ink ${
                      active ? "text-ink" : ""
                    }`}
                  >
                    {c.label}
                    <SortArrow active={active} dir={active ? order : undefined} />
                  </button>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {records.map((r) => (
            <tr key={r.id} className="border-b border-line/50 last:border-0 hover:bg-paper/70">
              {showCompany && (
                <td className="max-w-[220px] px-4 py-2.5 sm:px-5">
                  <Link
                    to={`/company/${r.companyId}`}
                    title="View company benchmarks"
                    className="block truncate font-medium text-ink hover:text-accent"
                  >
                    {r.companyName}
                  </Link>
                </td>
              )}
              {showRole && <td className="whitespace-nowrap py-2.5 pr-4 text-body">{r.roleName}</td>}
              <td className="py-2.5 pr-4">
                <LevelBadge name={r.levelName} />
              </td>
              {showLocation && (
                <td className="whitespace-nowrap py-2.5 pr-4 text-muted">{r.locationName}</td>
              )}
              <td className={`${cell} text-body`} title={r.base > 0 ? formatFull(r.base) : undefined}>
                {formatAmount(r.base)}
              </td>
              <td className={`${cell} text-body`} title={r.bonus > 0 ? formatFull(r.bonus) : undefined}>
                {formatAmount(r.bonus)}
              </td>
              <td className={`${cell} text-body`} title={r.equity > 0 ? formatFull(r.equity) : undefined}>
                {formatAmount(r.equity)}
              </td>
              <td
                className={`${cell} font-semibold text-ink`}
                title={formatFull(r.totalCompensation)}
              >
                {formatAmount(r.totalCompensation)}
              </td>
              {showExperience && <td className={`${cell} text-muted`}>{formatExperience(r.experience)}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}