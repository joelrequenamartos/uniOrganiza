import type { ReactNode } from "react";

export function ScreenHeader({
  title,
  action,
}: {
  title: string;
  action?: ReactNode;
}) {
  return (
    <header className="mb-5 flex items-center justify-between">
      <h1 className="text-[22px] font-semibold tracking-tight">{title}</h1>
      {action}
    </header>
  );
}

export function EmptyState({
  title,
  hint,
}: {
  title: string;
  hint?: string;
}) {
  return (
    <div className="rounded-card border border-border bg-surface px-5 py-10 text-center">
      <p className="text-sm font-medium text-text">{title}</p>
      {hint ? (
        <p className="mx-auto mt-1.5 max-w-[36ch] text-xs text-text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
