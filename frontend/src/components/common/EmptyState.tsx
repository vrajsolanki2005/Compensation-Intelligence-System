interface EmptyStateProps {
  title: string;
  hint?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ title, hint, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="py-14 text-center">
      <p className="text-[15px] font-medium text-ink">{title}</p>
      {hint ? <p className="mx-auto mt-1.5 max-w-sm text-sm leading-6 text-muted">{hint}</p> : null}
      {actionLabel && onAction ? (
        <button
          type="button"
          onClick={onAction}
          className="mt-4 h-9 rounded border border-line bg-surface px-4 text-sm font-medium hover:border-accent hover:text-accent"
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}