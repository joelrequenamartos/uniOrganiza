import { EmptyState, ScreenHeader } from "@/components/ui/screen-header";

/** Calendario: vista mensual + diaria/semanal. Real content in Phase 5. */
export default function CalendarPage() {
  return (
    <>
      <ScreenHeader title="Calendario" />
      <EmptyState
        title="Calendario en camino"
        hint="Vista mensual con indicadores y vista diaria por horario — Fase 5."
      />
    </>
  );
}
