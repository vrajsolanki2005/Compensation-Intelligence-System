export function ErrorState({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className="py-12 text-center" role="alert">
      <p className="text-[15px] font-medium text-ink">We couldn't load this data.</p>
      <p className="mt-1 text-sm text-muted">Try again.</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 h-9 rounded border border-line bg-surface px-4 text-sm font-medium hover:border-accent hover:text-accent"
        >
          Try again
        </button>
      ) : null}
    </div>
  );
}