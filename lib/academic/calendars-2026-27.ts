/**
 * Academic calendars, Grado en Ingeniería Informática, curso 2026/27.
 *
 * Static reference data read from the university's original calendars. Kept
 * separate from the synced events on purpose: this is the whole-year picture
 * (starts, exam periods, holidays), not the day-to-day schedule.
 * Dates are plain "yyyy-MM-dd" strings — no timezone involved.
 */

export type Course = 1 | 2;
export type Convocatoria = 1 | 2;

export interface AcademicSubject {
  id: string;
  name: string;
  course: Course;
  group: "A" | "B";
  teacher: string | null;
  /** First day of the subject. */
  start: string;
  color: string;
}

export interface AcademicExam {
  date: string;
  convocatoria: Convocatoria;
  subjectId: string;
}

export const SUBJECTS: AcademicSubject[] = [
  { id: "calculo", name: "Cálculo", course: 1, group: "A", teacher: "Fátima López Martínez", start: "2026-10-15", color: "#E8A39B" },
  { id: "fund-comp", name: "Fundamentos de Computadores", course: 1, group: "A", teacher: "Daniel Romero Pérez", start: "2026-10-19", color: "#B3B3B3" },
  { id: "oge", name: "Organización y Gestión de Empresas", course: 1, group: "A", teacher: "Pau Amigó Navarro", start: "2027-02-10", color: "#F2A65A" },
  { id: "toc", name: "Tecnología y Organización de Computadores", course: 1, group: "A", teacher: "Héctor Simarro Moncholi", start: "2027-02-11", color: "#C9C64A" },
  { id: "iuc", name: "Interfaces usuario-computador", course: 2, group: "A", teacher: "Héctor Simarro Moncholi", start: "2026-10-14", color: "#E8809A" },
  { id: "fis", name: "Fundamentos de Ingeniería de Software", course: 2, group: "B", teacher: null, start: "2027-02-09", color: "#6FDCCB" },
];

export const EXAMS: AcademicExam[] = [
  { date: "2027-01-28", convocatoria: 1, subjectId: "fund-comp" },
  { date: "2027-02-01", convocatoria: 1, subjectId: "calculo" },
  { date: "2027-02-04", convocatoria: 1, subjectId: "iuc" },
  { date: "2027-05-19", convocatoria: 1, subjectId: "fis" },
  { date: "2027-05-26", convocatoria: 1, subjectId: "oge" },
  { date: "2027-05-27", convocatoria: 1, subjectId: "toc" },
  { date: "2027-06-03", convocatoria: 2, subjectId: "fund-comp" },
  { date: "2027-06-07", convocatoria: 2, subjectId: "calculo" },
  { date: "2027-06-10", convocatoria: 2, subjectId: "iuc" },
  { date: "2027-06-25", convocatoria: 2, subjectId: "fis" },
  { date: "2027-06-30", convocatoria: 2, subjectId: "oge" },
  { date: "2027-07-01", convocatoria: 2, subjectId: "toc" },
];

export const HOLIDAYS: string[] = [
  "2026-10-09", "2026-10-12", "2026-12-08", "2026-12-25",
  "2027-01-01", "2027-01-06", "2027-03-19", "2027-03-26", "2027-03-29",
  "2027-04-05", "2027-06-24",
];

/** Inclusive date ranges. */
export const NON_TEACHING: { from: string; to: string }[] = [
  { from: "2026-12-21", to: "2026-12-24" },
  { from: "2026-12-28", to: "2026-12-31" },
  { from: "2027-01-04", to: "2027-01-05" },
  { from: "2027-04-01", to: "2027-04-02" },
  { from: "2027-08-02", to: "2027-08-31" },
];

/** Octubre 2026 → septiembre 2027. */
export const MONTHS: { year: number; month: number }[] = Array.from(
  { length: 12 },
  (_, i) => ({ year: 2026 + Math.floor((9 + i) / 12), month: (9 + i) % 12 }),
);
