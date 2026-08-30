export function LevelBadge({ name, large = false }: { name: string; large?: boolean }) {
  return (
    <span
      className={`fig inline-flex items-center rounded border border-accent/25 bg-accent/10 px-1.5 uppercase tracking-wide text-accent ${
        large ? "py-0.5 text-[13px]" : "text-[11px]"
      }`}
    >
      {name}
    </span>
  );
}