import { EmptyState, ScreenHeader } from "@/components/ui/screen-header";

/** Asignaturas. Real content in Phase 6. */
export default function SubjectsPage() {
  return (
    <>
      <ScreenHeader title="Asignaturas" />
      <EmptyState
        title="Todavía no hay asignaturas"
        hint="Se importarán del calendario de tu universidad o podrás crearlas — Fase 6."
      />
    </>
  );
}
