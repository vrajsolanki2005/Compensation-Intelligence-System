import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useMetadata } from "../hooks/useMetadata";
import {
  useCompensationList,
  useCompensationSummary,
} from "../hooks/useCompensation";
import { FilterBar, type FilterValues } from "../components/filters/FilterBar";
import { CompensationSummary } from "../components/compensation/CompensationSummary";
import { CompensationBreakdown } from "../components/compensation/CompensationBreakdown";
import { CompensationTable } from "../components/compensation/CompensationTable";
import { LevelBadge } from "../components/common/LevelBadge";
import { ErrorState } from "../components/common/ErrorState";
import { EmptyState } from "../components/common/EmptyState";
import { TableSkeleton } from "../components/common/Skeleton";
import { Pagination } from "../components/common/Pagination";
import { PageContainer, Section } from "../components/layout/PageContainer";
import type { CompensationQuery } from "../types/compensation";
import { formatCount, formatRange } from "../utils/format";

const LIMIT = 20;

function SummarySkeleton() {
  return (
    <div
      className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-4"
      aria-hidden="true"
    >
      {["p25", "p50", "p75", "p90"].map((k) => (
        <div key={k}>
          <div className="h-3 w-9 animate-pulse rounded bg-line/70" />
          <div className="mt-2 h-6 w-16 animate-pulse rounded bg-line/70" />
        </div>
      ))}
    </div>
  );
}

export default function ExplorerPage() {
  const [sp, setSearchParams] = useSearchParams();
  const { roleName, levelName, locationName, companyName } = useMetadata();

  const roleId = sp.get("roleId") ?? "";
  const levelId = sp.get("levelId") ?? "";
  const locationId = sp.get("locationId") ?? "";
  const companyId = sp.get("companyId") ?? "";
  const minTC = sp.get("minTC") ?? "";
  const maxTC = sp.get("maxTC") ?? "";
  const page = Math.max(1, Number(sp.get("page")) || 1);
  const sort = sp.get("sort") ?? "totalCompensation";
  const order: "asc" | "desc" = sp.get("order") === "asc" ? "asc" : "desc";

  const patch = (
    p: Partial<FilterValues> & { sort?: string; order?: string },
  ) => {
    const next = new URLSearchParams(sp);
    for (const [k, v] of Object.entries(p)) {
      if (v) next.set(k, v);
      else next.delete(k);
    }
    next.delete("page"); // any filter or sort change restarts pagination
    setSearchParams(next);
  };

  const goToPage = (p: number) => {
    const next = new URLSearchParams(sp);
    next.set("page", String(p));
    setSearchParams(next);
    window.scrollTo({ top: 0 });
  };

  const resetFilters = () => setSearchParams(new URLSearchParams());

  const query: CompensationQuery = {
    roleId: roleId ? Number(roleId) : undefined,
    levelId: levelId ? Number(levelId) : undefined,
    locationId: locationId ? Number(locationId) : undefined,
    companyId: companyId ? Number(companyId) : undefined,
    minTC:
      minTC && Number.isFinite(Number(minTC))
        ? Number(minTC) * 100000
        : undefined,
    maxTC:
      maxTC && Number.isFinite(Number(maxTC))
        ? Number(maxTC) * 100000
        : undefined,
    sort,
    order,
    page,
    limit: LIMIT,
  };

  const list = useCompensationList(query);

  const summaryParams =
    roleId && levelId && locationId
      ? {
          roleId: Number(roleId),
          levelId: Number(levelId),
          locationId: Number(locationId),
          companyId: companyId ? Number(companyId) : undefined,
        }
      : null;
  const summary = useCompensationSummary(summaryParams);

  // If the URL points past the last page (stale link), pull it back.
  useEffect(() => {
    if (
      !list.loading &&
      list.total > 0 &&
      list.records.length === 0 &&
      page > 1
    ) {
      goToPage(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [list.loading, list.total, list.records.length, page]);

  useEffect(() => {
    document.title = "Compensation Explorer — COMPINT";
  }, []);

  const handleSort = (field: string) => {
    patch({
      sort: field,
      order: sort === field && order === "desc" ? "asc" : "desc",
    });
  };

  const values: FilterValues = {
    roleId,
    levelId,
    locationId,
    companyId,
    minTC,
    maxTC,
  };

  // Role · Level · Location — shown once, near the results, level emphasized.
  const ctxRole = roleId ? roleName(Number(roleId)) : null;
  const ctxLevel = levelId ? levelName(Number(levelId)) : null;
  const ctxLocation = locationId ? locationName(Number(locationId)) : null;
  const ctxCompany = companyId ? companyName(Number(companyId)) : null;
  const hasContext = Boolean(ctxRole || ctxLevel || ctxLocation || ctxCompany);

  const showBenchmark = Boolean(roleId && levelId && locationId);
  const tableCols =
    6 + (showRoleColumn() ? 1 : 0) + (showLocationColumn() ? 1 : 0);
  function showRoleColumn() {
    return !roleId;
  }
  function showLocationColumn() {
    return !locationId;
  }

  return (
    <PageContainer>
      <header className="border-b border-line pb-6">
        <h1 className="text-2xl font-semibold tracking-tight">
          Compensation Explorer
        </h1>
        <p className="mt-1.5 text-[15px] text-muted">
          See what comparable roles are actually paid.
        </p>
      </header>

      <div className="mt-6">
        <FilterBar values={values} onChange={patch} onReset={resetFilters} />
      </div>

      {hasContext && (
        <div className="mt-9 flex flex-wrap items-center gap-x-2.5 gap-y-2 text-[17px]">
          <span className="font-semibold tracking-tight">
            {ctxRole ?? "All roles"}
          </span>
          <span className="text-faint">·</span>
          {ctxLevel ? (
            <LevelBadge name={ctxLevel} large />
          ) : (
            <span className="text-muted">All levels</span>
          )}
          {ctxLocation ? (
            <>
              <span className="text-faint">·</span>
              <span className="text-muted">{ctxLocation}</span>
            </>
          ) : null}
          {ctxCompany ? (
            <>
              <span className="text-faint">·</span>
              <span className="text-muted">{ctxCompany}</span>
            </>
          ) : null}
        </div>
      )}

      {showBenchmark && (
        <Section
          title="Market benchmark"
          aside={
            !summary.loading && !summary.error && summary.data
              ? `Based on ${formatCount(summary.data.count)} records`
              : undefined
          }
        >
          {summary.error ? (
            <ErrorState onRetry={summary.retry} />
          ) : summary.loading ? (
            <SummarySkeleton />
          ) : summary.data ? (
            <>
              <CompensationSummary summary={summary.data} />
              <div className="mt-8">
                <h3 className="text-[13px] font-medium text-ink">
                  Median package
                </h3>
                <div className="mt-3">
                  <CompensationBreakdown
                    base={summary.data.base.p50}
                    bonus={summary.data.bonus.p50}
                    equity={summary.data.equity.p50}
                    total={summary.data.totalCompensation.p50}
                  />
                </div>
              </div>
            </>
          ) : null}
        </Section>
      )}

      <Section
        title="Compensation records"
        aside={
          !list.loading && !list.error
            ? formatRange(page, LIMIT, list.total)
            : undefined
        }
      >
        {list.error ? (
          <ErrorState onRetry={list.retry} />
        ) : list.loading ? (
          <div className="rounded border border-line bg-surface">
            <TableSkeleton rows={9} cols={tableCols} />
          </div>
        ) : list.records.length === 0 ? (
          <div className="rounded border border-line bg-surface">
            <EmptyState
              title="Nothing matches these filters."
              hint="Try a different level, location or company."
              actionLabel="Clear filters"
              onAction={resetFilters}
            />
          </div>
        ) : (
          <div className="overflow-hidden rounded border border-line bg-surface">
            <CompensationTable
              records={list.records}
              sort={sort}
              order={order}
              onSort={handleSort}
              showRole={showRoleColumn()}
              showLocation={showLocationColumn()}
            />
            <Pagination
              page={page}
              limit={LIMIT}
              total={list.total}
              onPage={goToPage}
            />
          </div>
        )}
      </Section>
    </PageContainer>
  );
}
