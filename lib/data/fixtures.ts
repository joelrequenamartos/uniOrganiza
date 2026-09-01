/**
 * Temporary in-memory data — used until Supabase is wired up (final phase).
 *
 * Subjects are the real ones (GIIN, 1º/2º). Events are generated relative to
 * "now" so the dashboard always has something meaningful to show while we build.
 * The public API in lib/data/* mirrors what the Supabase-backed version will
 * expose, so swapping the implementation later touches only those files.
 */
import type { AcademicEvent, Subject } from "@/types/domain";

export const SUBJECTS: Subject[] = [
  { id: "s-calculo", name: "Cálculo", color: "#7aa2f7", externalRef: "80346", createdAt: "2026-09-01T00:00:00.000Z" },
  { id: "s-fund-comp", name: "Fundamentos de Computadores", color: "#bb9af7", externalRef: "80348", createdAt: "2026-09-01T00:00:00.000Z" },
  { id: "s-oge", name: "Organización y Gestión de Empresas", color: "#e0af68", externalRef: "80352", createdAt: "2026-09-01T00:00:00.000Z" },
  { id: "s-toc", name: "Tecnología y Organización de Computadores", color: "#7dcfff", externalRef: "80353", createdAt: "2026-09-01T00:00:00.000Z" },
  { id: "s-iuc", name: "Interfaces usuario / computador", color: "#9ece6a", externalRef: "80357", createdAt: "2026-09-01T00:00:00.000Z" },
  { id: "s-fis", name: "Fundamentos de Ingeniería de Software", color: "#f7768e", externalRef: "80361", createdAt: "2026-09-01T00:00:00.000Z" },
];

const subjectRef = (s: Subject) => ({ id: s.id, name: s.name, color: s.color });

/** Build an ISO instant `days` from now at local `hh:mm`. */
function at(days: number, hh: number, mm = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hh, mm, 0, 0);
  return d.toISOString();
}

const [calculo, fundComp, , toc, iuc, fis] = SUBJECTS;

export const EVENTS: AcademicEvent[] = [
  // --- Classes this week (source: university, read-only) --------------------
  mk("c1", toc, "class", "Clase", at(1, 10), at(1, 12), null, "university"),
  mk("c2", calculo, "class", "Clase", at(1, 16), at(1, 18), null, "university"),
  mk("c3", fundComp, "class", "Clase", at(3, 9), at(3, 11), null, "university"),
  mk("c4", iuc, "class", "Clase", at(4, 12, 30), at(4, 14, 30), null, "university"),
  mk("c5", toc, "class", "Clase", at(6, 10), at(6, 12), null, "university"),

  // --- Assignments (manual) ----------------------------------------------
  mk("a1", fundComp, "assignment", "Práctica 1", null, null, at(3, 23, 59), "manual"),
  mk("a2", calculo, "assignment", "Boletín de ejercicios", null, null, at(9, 23, 59), "manual"),
  mk("a3", iuc, "assignment", "Entrega prototipo", null, null, at(-1, 23, 59), "manual"), // overdue

  // --- Activity (manual) ------------------------------------------------------
  mk("act1", fis, "activity", "Sesión de laboratorio", at(5, 17), at(5, 19), null, "manual"),

  // --- Exam (manual) --------------------------------------------------------
  mk("e1", toc, "exam", "Examen parcial", at(12, 9), at(12, 11), null, "manual"),
];

function mk(
  id: string,
  subject: Subject,
  type: AcademicEvent["type"],
  title: string,
  startAt: string | null,
  endAt: string | null,
  dueAt: string | null,
  source: AcademicEvent["source"],
): AcademicEvent {
  return {
    id,
    subjectId: subject.id,
    subject: subjectRef(subject),
    type,
    title,
    description: null,
    startAt,
    endAt,
    dueAt,
    allDay: false,
    status: source === "university" ? "read_only" : "pending",
    source,
    externalId: source === "university" ? `ext-${id}` : null,
    createdAt: "2026-09-01T00:00:00.000Z",
    updatedAt: "2026-09-01T00:00:00.000Z",
  };
}
