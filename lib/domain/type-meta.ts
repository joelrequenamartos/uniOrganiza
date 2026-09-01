import type { EventType, PriorityLevel } from "@/types/domain";

export const EVENT_TYPE_META: Record<
  EventType,
  { label: string; plural: string; cssVar: string }
> = {
  assignment: { label: "Entrega", plural: "Entregas", cssVar: "var(--type-assignment)" },
  exam: { label: "Examen", plural: "Exámenes", cssVar: "var(--type-exam)" },
  activity: { label: "Actividad", plural: "Actividades", cssVar: "var(--type-activity)" },
  class: { label: "Clase", plural: "Clases", cssVar: "var(--type-class)" },
};

export const PRIORITY_COLOR: Record<PriorityLevel, string> = {
  overdue: "var(--prio-overdue)",
  max: "var(--prio-max)",
  high: "var(--prio-high)",
  medium: "var(--prio-medium)",
  low: "var(--prio-low)",
  none: "var(--prio-low)",
};
