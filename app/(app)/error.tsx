"use client";

import { useEffect } from "react";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60dvh] flex-col items-center justify-center gap-4 text-center">
      <div>
        <p className="text-sm font-medium text-text">Algo ha ido mal</p>
        <p className="mx-auto mt-1 max-w-[32ch] text-xs text-text-muted">
          No se ha podido cargar esta pantalla. Inténtalo de nuevo.
        </p>
      </div>
      <button
        type="button"
        onClick={reset}
        className="h-10 rounded-xl bg-surface-2 px-5 text-sm font-medium text-text transition-colors active:bg-border-strong"
      >
        Reintentar
      </button>
    </div>
  );
}
