import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useMetadata } from "../hooks/useMetadata";
import { useComparison } from "../hooks/useCompensation";
import { SelectField } from "../components/filters/SelectField";
import { CompanySelector } from "../components/comparison/CompanySelector";
import { ComparisonTable } from "../components/comparison/ComparisonTable";
import { ComparisonChart } from "../components/comparison/ComparisonChart";
import { LevelBadge } from "../components/common/LevelBadge";
import { ErrorState } from "../components/common/ErrorState";
import { PageContainer, Section } from "../components/layout/PageContainer";
import type { CompareParams, ComparisonRow } from "../types/compensation";
import { formatCompact } from "../utils/currency";

function buildInsight(rows: ComparisonRow[]): string | null {
  if (rows.length < 2) return null;
  const sorted = [...rows].sort((a, b) => b.totalCompensation - a.totalCompensation);
  const [top, second] = sorted;
  if (top.totalCompensation <= 0) return null;

  const lead = top.totalCompensation - second.totalCompensation;
  let text = `${top.companyName} has the highest total compensation in this comparison, ahead of ${second.companyName} by ${formatCompact(lead)}.`;
  if (top.equity > 0) {
    const share = Math.round((top.equity / top.totalCompensation) * 100);
    text += ` Equity makes up ${share}% of its package.`;
  }
  return text;
}

export default function ComparePage() {
  const [sp, setSearchParams] = useSearchParams();
  const { roles, levels, locations, companies, roleName, levelName, locationName } = useMetadata();

  const roleId = sp.get("roleId") ?? "";
  const levelId = sp.get("levelId") ?? "";
  const locationId = sp.get("locationId") ?? "";
  const companyIds = (sp.get("companyIds") ?? "")
    .split(",")
    .filter(Boolean)
    .map(Number)
    .filter((n) => Number.isInteger(n));

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(sp);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next);
  };

  const toggleCompany = (id: number) => {
    const next = companyIds.includes(id)
      ? companyIds.filter((x) => x !== id)
      : [...companyIds, id];
    setParam("companyIds", next.join(","));
  };

  const contextReady = Boolean(roleId && levelId && locationId);
  const params: CompareParams | null =
    contextReady && companyIds.length >= 2
      ? {
          roleId: Number(roleId),
          levelId: Number(levelId),
          locationId: Number(locationId),
          companyIds,
        }
      : null;
  const comparison = useComparison(params);

  useEffect(() => {
    document.title = "Compare — COMPINT";
  }, []);

  const opts = (list: { id: number; name: string }[]) =>
    list.map((x) => ({ value: String(x.id), label: x.name }));

  const insight = comparison.rows.length > 0 ? buildInsight(comparison.rows) : null;
  const ctxRole = roleId ? roleName(Number(roleId)) : null;
  const ctxLevel = levelId ? levelName(Number(levelId)) : null;
  const ctxLocation = locationId ? locationName(Number(locationId)) : null;

  return (
    <PageContainer>
      <header className="border-b border-line pb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Compare offers</h1>
        <p className="mt-1.5 text-[15px] text-muted">
          Keep the role, level and location fixed. Change the company.
        </p>
      </header>

      <div className="mt-6 grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-3">
        <SelectField
          label="Role"
          placeholder="All roles"
          value={roleId}
          onChange={(v) => setParam("roleId", v)}
          options={opts(roles)}
        />
        <SelectField
          label="Level"
          placeholder="All levels"
          value={levelId}
          onChange={(v) => setParam("levelId", v)}
          options={opts(levels)}
        />
        <SelectField
          label="Location"
          placeholder="All locations"
          value={locationId}
          onChange={(v) => setParam("locationId", v)}
          options={opts(locations)}
        />
      </div>

      <div className="mt-8">
        <CompanySelector
          companies={companies}
          selected={companyIds}
          onToggle={toggleCompany}
          onClear={() => setParam("companyIds", "")}
        />
      </div>

      {contextReady && ctxRole && ctxLevel && ctxLocation && (
        <div className="mt-9 flex flex-wrap items-center gap-x-2.5 gap-y-2 text-[17px]">
          <span className="font-semibold tracking-tight">{ctxRole}</span>
          <span className="text-faint">·</span>
          <LevelBadge name={ctxLevel} large />
          <span className="text-faint">·</span>
          <span className="text-muted">{ctxLocation}</span>
        </div>
      )}

      {params ? (
        comparison.error ? (
          <Section title="Comparison">
            <ErrorState onRetry={comparison.retry} />
          </Section>
        ) : comparison.loading ? (
          <Section title="Comparison">
            <div className="space-y-3" aria-hidden="true">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-4 animate-pulse rounded bg-line/70"
                  style={{ width: `${92 - i * 14}%` }}
                />
              ))}
            </div>
          </Section>
        ) : comparison.rows.length === 0 ? (
          <Section title="Comparison">
            <p className="py-8 text-sm text-muted">
              No records match this role, level and location for the selected companies.
            </p>
          </Section>
        ) : (
          <>
            <Section title="Comparison">
              <ComparisonTable rows={comparison.rows} />
              {insight && <p className="mt-4 max-w-2xl text-sm leading-6 text-body">{insight}</p>}
            </Section>
            <Section title="Total compensation">
              <ComparisonChart rows={comparison.rows} />
            </Section>
          </>
        )
      ) : (
        <p className="mt-10 border-t border-line pt-5 text-sm leading-6 text-muted">
          {contextReady
            ? "Select at least two companies to compare."
            : "Pick a role, level and location first — comparison only makes sense between equivalent roles."}
        </p>
      )}
    </PageContainer>
  );
}