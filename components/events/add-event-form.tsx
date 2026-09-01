"use client";

/**
 * Placeholder. The real quick-create form (name / subject / date / time /
 * description, with validation and a Server Action) lands in Phase 7.
 */
export function AddEventForm({ onDone }: { onDone: () => void }) {
  return (
    <div className="flex flex-col gap-4 py-2">
      <p className="text-sm text-text-muted">
        El formulario para crear entregas, actividades y exámenes se implementa
        en la Fase 7.
      </p>
      <button
        type="button"
        onClick={onDone}
        className="h-11 rounded-xl bg-surface-2 text-sm font-medium text-text transition-colors hover:bg-border-strong"
      >
        Entendido
      </button>
    </div>
  );
}
