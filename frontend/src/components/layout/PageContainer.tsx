import type { ReactNode } from "react";

export function PageContainer({ children }: { children: ReactNode }) {
  return <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-10">{children}</main>;
}

interface SectionProps {
  title: string;
  aside?: ReactNode;
  children: ReactNode;
}

/** A section heading with a hairline rule — content sits directly on the page. */
export function Section({ title, aside, children }: SectionProps) {
  return (
    <section className="mt-10">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-line pb-2.5">
        <h2 className="text-[13px] font-medium text-ink">{title}</h2>
        {aside ? <p className="text-xs text-muted">{aside}</p> : null}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}