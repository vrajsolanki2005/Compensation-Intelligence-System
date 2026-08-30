import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-5 text-xs text-muted sm:px-6">
        <p>COMPINT · compensation benchmarks</p>
        <p>
          Runs on a synthetic dataset — see the{" "}
          <Link to="/about" className="underline underline-offset-2 hover:text-ink">
            methodology
          </Link>
          .
        </p>
      </div>
    </footer>
  );
}