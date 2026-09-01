/**
 * Placeholder home. Phase 3 replaces this with the (app) route group:
 * bottom navigation + Dashboard / Calendario / Asignaturas / Añadir.
 */
export default function Home() {
  return (
    <main
      className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-3 px-6 text-center"
      style={{
        paddingTop: "var(--safe-top)",
        paddingBottom: "var(--safe-bottom)",
      }}
    >
      <h1 className="text-lg font-semibold tracking-tight">uniOrganiza</h1>
      <p className="text-sm text-text-muted">
        Tu universidad en una sola pantalla.
      </p>
      <p className="mt-4 text-xs text-text-faint">
        Fase 1 · arquitectura lista. Siguiente: Supabase y esquema de datos.
      </p>
    </main>
  );
}
