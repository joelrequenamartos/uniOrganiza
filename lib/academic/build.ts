/**
 * Turns the static academic data into what the calendar screens render:
 * a per-day paint map, a legend and a chronological list. Pure.
 */
import {
  EXAMS,
  HOLIDAYS,
  NON_TEACHING,
  SUBJECTS,
  type AcademicSubject,
  type Course,
} from "./calendars-2026-27";

export type CalendarId = "primero" | "segundo" | "examenes";

export const CALENDAR_TABS: { id: CalendarId; label: string; title: string }[] = [
  { id: "primero", label: "1.º curso", title: "Primer curso · Grupo A" },
  { id: "segundo", label: "2.º curso", title: "Segundo curso" },
  { id: "examenes", label: "Exámenes", title: "Exámenes 2026/27" },
];

export function isCalendarId(v: string | undefined): v is CalendarId {
  return v === "primero" || v === "segundo" || v === "examenes";
}

const COLOR = {
  holiday: { bg: "#E8554E", fg: "#FFFFFF" },
  nonTeaching: { bg: "#E9C3F2", fg: "#000000" },
  exam1: { bg: "#7FD18B", fg: "#000000" },
  exam2: { bg: "#2E7D4F", fg: "#FFFFFF" },
  course1: { bg: "#2F6FD6", fg: "#FFFFFF" },
  course2: { bg: "#2E9E5B", fg: "#FFFFFF" },
} as const;

export interface DayPaint {
  bg: string;
  fg: string;
  /** Small marker in the cell corner: "I" (start) or "1ª"/"2ª" (exams view). */
  tag?: string;
}

export interface LegendItem {
  color: string;
  label: string;
}

export interface ListRow {
  /** Sort key, yyyy-MM-dd. */
  sort: string;
  /** yyyy-MM-dd, or "from|to" for ranges. */
  date: string;
  dateTo?: string;
  type: string;
  subject: string;
  detail: string;
  color: string;
}

export interface BuiltCalendar {
  title: string;
  subtitle?: string;
  paint: Map<string, DayPaint>;
  legendLeft: LegendItem[];
  legendRight: LegendItem[];
  note: string;
  rows: ListRow[];
}

function eachDay(from: string, to: string): string[] {
  const out: string[] = [];
  const d = new Date(`${from}T00:00:00Z`);
  const end = new Date(`${to}T00:00:00Z`);
  for (; d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}

const subjectById = new Map(SUBJECTS.map((s) => [s.id, s]));

export function buildCalendar(id: CalendarId): BuiltCalendar {
  const tab = CALENDAR_TABS.find((t) => t.id === id)!;
  const examsOnly = id === "examenes";
  const course: Course | null = id === "primero" ? 1 : id === "segundo" ? 2 : null;

  const subjects = SUBJECTS.filter((s) => course === null || s.course === course);
  const exams = EXAMS.filter((e) => {
    const s = subjectById.get(e.subjectId)!;
    return course === null || s.course === course;
  });

  // Paint low → high priority: no lectivo < inicio < examen < festivo.
  const paint = new Map<string, DayPaint>();
  for (const r of NON_TEACHING) {
    for (const d of eachDay(r.from, r.to)) paint.set(d, COLOR.nonTeaching);
  }
  if (!examsOnly) {
    for (const s of subjects) {
      paint.set(s.start, { bg: s.color, fg: "#000000", tag: "I" });
    }
  }
  for (const e of exams) {
    const s = subjectById.get(e.subjectId)!;
    if (examsOnly) {
      const c = s.course === 1 ? COLOR.course1 : COLOR.course2;
      paint.set(e.date, { ...c, tag: `${e.convocatoria}ª` });
    } else {
      paint.set(e.date, e.convocatoria === 1 ? COLOR.exam1 : COLOR.exam2);
    }
  }
  for (const d of HOLIDAYS) paint.set(d, COLOR.holiday);

  const commonLegend: LegendItem[] = [
    { color: COLOR.holiday.bg, label: "Festivo" },
    { color: COLOR.nonTeaching.bg, label: "No lectivo" },
  ];
  const legendLeft: LegendItem[] = examsOnly
    ? [
        { color: COLOR.course1.bg, label: "Exámenes 1.º curso" },
        { color: COLOR.course2.bg, label: "Exámenes 2.º curso" },
      ]
    : [
        ...commonLegend,
        { color: COLOR.exam1.bg, label: "Examen 1.ª convocatoria" },
        { color: COLOR.exam2.bg, label: "Examen 2.ª convocatoria" },
      ];
  const legendRight: LegendItem[] = examsOnly
    ? commonLegend
    : subjects.map((s) => ({ color: s.color, label: s.name }));

  const rows: ListRow[] = [];
  const examRow = (e: (typeof EXAMS)[number]): ListRow => {
    const s = subjectById.get(e.subjectId)!;
    return {
      sort: e.date,
      date: e.date,
      type: `Examen ${e.convocatoria}.ª convocatoria`,
      subject: s.name,
      detail: examsOnly ? `${s.course}.º curso` : "",
      color: examsOnly
        ? (s.course === 1 ? COLOR.course1 : COLOR.course2).bg
        : (e.convocatoria === 1 ? COLOR.exam1 : COLOR.exam2).bg,
    };
  };
  rows.push(...exams.map(examRow));
  if (!examsOnly) {
    for (const s of subjects) rows.push(startRow(s));
    for (const d of HOLIDAYS) {
      rows.push({ sort: d, date: d, type: "Festivo", subject: "", detail: "", color: COLOR.holiday.bg });
    }
    for (const r of NON_TEACHING) {
      rows.push({
        sort: r.from,
        date: r.from,
        dateTo: r.to,
        type: "No lectivo",
        subject: "",
        detail: "",
        color: COLOR.nonTeaching.bg,
      });
    }
  }
  rows.sort((a, b) => a.sort.localeCompare(b.sort));

  return {
    title: tab.title,
    subtitle: examsOnly ? "Solo exámenes · azul = 1.º curso · verde = 2.º curso" : undefined,
    paint,
    legendLeft,
    legendRight,
    note: examsOnly
      ? "Dentro de cada día: 1.ª o 2.ª = convocatoria."
      : "I = inicio de asignatura (marcado con la letra I en el día).",
    rows,
  };
}

function startRow(s: AcademicSubject): ListRow {
  return {
    sort: s.start,
    date: s.start,
    type: "Inicio de asignatura",
    subject: s.name,
    detail: `Grupo ${s.group}${s.teacher ? ` · ${s.teacher}` : ""}`,
    color: s.color,
  };
}
