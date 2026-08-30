import { Link, NavLink } from "react-router-dom";

function LadderMark() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" className="text-accent">
      <rect x="0.5" y="8" width="3" height="5.5" rx="0.5" fill="currentColor" />
      <rect x="5.5" y="4.5" width="3" height="9" rx="0.5" fill="currentColor" opacity="0.7" />
      <rect x="10.5" y="1" width="3" height="12.5" rx="0.5" fill="currentColor" opacity="0.45" />
    </svg>
  );
}

export default function Navbar() {
  const link = ({ isActive }: { isActive: boolean }) =>
    `px-1.5 py-1 text-sm sm:px-2 ${isActive ? "font-medium text-ink" : "text-muted hover:text-ink"}`;

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface/95 backdrop-blur-sm">
      <div className="mx-auto flex h-12 max-w-6xl items-center gap-4 px-4 sm:gap-6 sm:px-6">
        <Link
          to="/"
          aria-label="COMPINT home"
          className="flex items-center gap-2 text-[15px] font-semibold tracking-tight"
        >
          <LadderMark />
          COMPINT
        </Link>
        <nav aria-label="Primary" className="flex items-center gap-0.5 sm:gap-1">
          <NavLink to="/" end className={link}>
            Explorer
          </NavLink>
          <NavLink to="/compare" className={link}>
            Compare
          </NavLink>
          <NavLink to="/about" className={link}>
            Methodology
          </NavLink>
        </nav>
        <span className="ml-auto text-xs text-muted" title="All amounts shown in Indian rupees">
          INR
        </span>
      </div>
    </header>
  );
}