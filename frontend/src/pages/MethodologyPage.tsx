import { useEffect } from "react";
import { PageContainer } from "../components/layout/PageContainer";

export default function MethodologyPage() {
  useEffect(() => {
    document.title = "Methodology — COMPINT";
  }, []);

  return (
    <PageContainer>
      <div className="max-w-[680px]">
        <header className="border-b border-line pb-6">
          <h1 className="text-2xl font-semibold tracking-tight">Methodology</h1>
          <p className="mt-1.5 text-[15px] text-muted">How COMPINT compares compensation.</p>
        </header>

        <section className="mt-8">
          <h2 className="text-[15px] font-semibold">Why levels matter</h2>
          <p className="mt-3 text-[14px] leading-7 text-body">
            Job titles vary significantly between companies. A “Staff Engineer” at one company can
            carry the same scope as a “Senior Engineer” at another, and neither title tells you
            where the role sits on the ladder. Comparing offers by title alone compares labels, not
            jobs.
          </p>
          <p className="mt-3 text-[14px] leading-7 text-body">
            That's why COMPINT compares compensation using canonical levels (IC2, IC3, IC4 …) in
            addition to titles. Level is the strongest single predictor of where a package lands in
            its band — which is why it's pinned as a badge next to every record, and why the market
            benchmark only appears once a role, level <em>and</em> location are all set.
          </p>
        </section>

        <section className="mt-8 border-t border-line pt-7">
          <h2 className="text-[15px] font-semibold">Total compensation</h2>
          <p className="mt-3 text-[14px] leading-7 text-body">
            Every record is broken into three components, and the total is what the backend
            reports — never recalculated in the browser.
          </p>
          <p className="fig mt-4 rounded border border-line bg-surface px-4 py-3 text-[14px]">
            Total Compensation = Base Salary + Bonus + Equity
          </p>
          <ul className="mt-4 space-y-2 text-[13.5px] leading-6 text-body">
            <li>
              <span className="font-medium text-ink">Base</span> — fixed annual cash.
            </li>
            <li>
              <span className="font-medium text-ink">Bonus</span> — variable cash, typically
              performance-linked.
            </li>
            <li>
              <span className="font-medium text-ink">Equity</span> — annualised value of stock
              grants.
            </li>
          </ul>
        </section>

        <section className="mt-8 border-t border-line pt-7">
          <h2 className="text-[15px] font-semibold">Percentiles</h2>
          <p className="mt-3 text-[14px] leading-7 text-body">
            Averages get dragged around by outliers; percentiles place a value inside the observed
            range. For each role, level and location, the benchmark reports four points of the
            total-compensation distribution:
          </p>
          <dl className="mt-4 text-[13.5px]">
            {[
              ["P25", "Lower market range — a quarter of records fall below this value."],
              ["P50", "Median — half of records fall below, half above."],
              ["P75", "Upper market range — a quarter of records fall above this value."],
              ["P90", "Top end of observed compensation."],
            ].map(([k, d]) => (
              <div key={k} className="flex gap-4 border-b border-line/60 py-2.5 last:border-0">
                <dt className="fig w-10 shrink-0 text-accent">{k}</dt>
                <dd className="leading-6 text-body">{d}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="mt-8 border-t border-line pt-7">
          <h2 className="text-[15px] font-semibold">Data</h2>
          <p className="mt-3 text-[14px] leading-7 text-body">
            The current dataset is synthetic/demo data used for development and product
            demonstration. It is not presented as verified salary data from Levels.fyi, 6figr,
            AmbitionBox or Glassdoor.
          </p>
          <p className="mt-3 text-[14px] leading-7 text-body">
            Every number shown in the app comes from the API — nothing is estimated or filled in on
            the frontend. If a field is empty in the data, it reads as empty in the interface.
          </p>
        </section>
      </div>
    </PageContainer>
  );
}