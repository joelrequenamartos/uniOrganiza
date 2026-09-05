export function Skeleton({
  className = "",
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      aria-hidden
      className={`animate-pulse rounded-lg bg-surface-2 ${className}`}
      style={style}
    />
  );
}

/** A stack of card-shaped placeholders, matching the list rows across the app. */
export function ListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 rounded-card border border-border bg-surface px-4 py-3.5"
        >
          <Skeleton className="h-8 w-1 shrink-0 rounded-full" />
          <div className="flex-1">
            <Skeleton className="h-3.5 w-1/2" />
            <Skeleton className="mt-2 h-3 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}
