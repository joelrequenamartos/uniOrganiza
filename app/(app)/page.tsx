import { EmptyState, ScreenHeader } from "@/components/ui/screen-header";

/** Dashboard / Inicio. Real content arrives in Phase 4. */
export default function DashboardPage() {
  return (
    <>
      <ScreenHeader title="Inicio" />
      <EmptyState
        title="Aún no hay nada que mostrar"
        hint="El dashboard con tu semana y lo que se acerca se implementa en la Fase 4."
      />
    </>
  );
}
