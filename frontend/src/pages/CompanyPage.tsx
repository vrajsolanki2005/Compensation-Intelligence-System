import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import {
  Bar,
  BarChart,
  LabelList,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { getCompany, getCompanyCompensationSummary } from "../api/companies";
import { useCompensationList } from "../hooks/useCompensation";
import { CompensationTable } from "../components/compensation/CompensationTable";
import { ErrorState } from "../components/common/ErrorState";
import { EmptyState } from "../components/common/EmptyState";
import { TableSkeleton } from "../components/common/Skeleton";
import { Pagination } from "../components/common/Pagination";
import { PageContainer, Section } from "../components/layout/PageContainer";
import type { Company, CompanyLevelSummary } from "../types/compensation";
import { formatCompact, formatFull } from "../utils/currency";
import { formatCount, formatRange } from "../utils/format";

const TABLE_LIMIT = 15;

export default function CompanyPage() {
  const { id } = useParams<{ id: string }>();
  const companyId = Number(id);
  const valid = Number.isInteger(companyId) && companyId > 0;

  const [company, setCompany] = useState<Company | null>(null);
  const [levels, setLevels] = useState<CompanyLevelSummary[]>([]);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState(false);

  const [page, setPage] = useState(1);
  const [sort, setSort] = useState("totalCompensation");
  const [order, setOrder] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    document.title = "Company — COMPINT";
  }, []);

  useEffect(() => {
    if (!valid) return;
    let cancelled = false;
    setProfileLoading(true);
    setProfileError(false);
    Promise.all([getCompany(companyId), getCompanyCompensationSummary(companyId)])
      .then(([c, summary]) => {
        if (cancelled) return;
        setCompany(c);
        setLevels(summary.levels);
        setProfileLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setProfileError(true);
        setProfileLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [companyId, valid]);

  useEffect(() => {
    if (company?.name) document.title = `${company.name} — COMPINT`;
  }, [company]);

  const list = useCompensationList(
    valid
      ? { companyId, page, sort, order, limit: TABLE_LIMIT }
      : { page: 1, limit: TABLE_LIMIT },
  );

  const handleSort = (field: string) => {
    if (field === sort) setOrder((o) => (o === "asc" ? "desc" : "asc"));
    else {
      setSort(field);
      setOrder("desc");
    }
    setPage(1);
  };

  if (!valid) return <Navigate to="/" replace />;

  const totalSamples = levels.reduce((sum, l) => sum + l.sampleCount, 0);
  const name = company?.name ?? `Company ${companyId}`;

  // Recharts renders the vertical axis bottom-up, so reverse for IC2 → IC5.
  const chartData = [...levels]
    .reverse()
    .map((l) => ({
      name: l.levelName,
      value: l.medianTotalCompensation,
      label: formatCompact(l.medianTotalCompensation),
    }));

  return (
    <PageContainer>
      <nav aria-label="Breadcrumb" className="mb-5 text-xs text-muted">
        <Link to="/" className="hover:text-ink">
          Explorer
        </Link>
        <span className="mx-1.5 text-faint">/</span>
        <span className="text-ink">{name}</span>
      </nav>

      <header className="border-b border-line pb-6">
        <h1 className="text-2xl font-semibold tracking-tight">{name}</h1>
        <p className="mt-1.5 text-[15px] text-muted">
          Compensation benchmarks{company?.website ? ` · ${company.website}` : ""}
        </p>
        <Link
          to={`/?companyId=${companyId}`}
          className="mt-3 inline-block text-sm text-accent underline-offset-2 hover:underline"
        >
          View this company in the Explorer →
        </Link>
      </header>

      <Section
        title="Total compensation by level"
        aside={
          !profileLoading && !profileError && levels.length > 0
            ? `${formatCount(totalSamples)} records`
            : undefined
        }
      >
        {profileError ? (
          <ErrorState onRetry={() => window.location.reload()} />
        ) : profileLoading ? (
          <div className="space-y-4" aria-hidden="true">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-4 w-14 animate-pulse rounded bg-line/70" />
                <div
                  className="h-4 animate-pulse rounded bg-line/70"
                  style={{ width: `${86 - i * 16}%` }}
                />
              </div>
            ))}
          </div>
        ) : levels.length === 0 ? (
          <EmptyState
            title="No compensation records yet."
            hint="There's no benchmark data for this company."
          />
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-[440px]">
              <ResponsiveContainer width="100%" height={levels.length * 48 + 8}>
                <BarChart
                  data={chartData}
                  layout="vertical"
                  margin={{ top: 4, right: 64, left: 0, bottom: 4 }}
                  barCategoryGap="35%"
                >
                  <XAxis type="number" domain={[0, "dataMax"]} hide />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={52}
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fill: "#1C1B17",
                      fontSize: 12,
                      fontFamily: "ui-monospace, Menlo, monospace",
                    }}
                  />
                  <Bar
                    dataKey="value"
                    fill="#1D5C41"
                    barSize={16}
                    radius={[0, 2, 2, 0]}
                    isAnimationActive={false}
                  >
                    <LabelList dataKey="label" position="right" style={{ fill: "#1C1B17", fontSize: 12 }} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <p className="mt-1 text-xs text-muted">
                Median total compensation per level, from {formatCount(totalSamples)} records.
              </p>
            </div>
          </div>
        )}
      </Section>

      <Section
        title="Compensation records"
        aside={!list.loading && !list.error ? formatRange(page, TABLE_LIMIT, list.total) : undefined}
      >
        {list.error ? (
          <ErrorState onRetry={list.retry} />
        ) : list.loading ? (
          <div className="rounded border border-line bg-surface">
            <TableSkeleton rows={8} cols={7} />
          </div>
        ) : list.records.length === 0 ? (
          <div className="rounded border border-line bg-surface">
            <EmptyState title="No compensation records." hint="Nothing found for this company." />
          </div>
        ) : (
          <div className="overflow-hidden rounded border border-line bg-surface">
            <CompensationTable
              records={list.records}
              sort={sort}
              order={order}
              onSort={handleSort}
              showCompany={false}
              showRole
              showLocation
              showExperience={false}
            />
            <Pagination
              page={page}
              limit={TABLE_LIMIT}
              total={list.total}
              onPage={(p) => {
                setPage(p);
                window.scrollTo({ top: 0 });
              }}
            />
          </div>
        )}
      </Section>
    </PageContainer>
  );
}