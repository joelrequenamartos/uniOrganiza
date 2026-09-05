/**
 * Data-access layer. The rest of the app imports only from here.
 *
 * Reads/writes go through the temporary in-memory store (./store). When
 * Supabase is wired up (final phase) each function's body is replaced with a
 * query against `createClient()` — signatures and return types stay identical.
 */
import type { AcademicEvent, EventType, Subject } from "@/types/domain";
import { SUBJECTS } from "./fixtures";
import { addEvent, allEvents, updateEventStatus } from "./store";

export const USING_FIXTURES = true;

export async function getSubjects(): Promise<Subject[]> {
  return [...SUBJECTS].sort((a, b) => a.name.localeCompare(b.name, "es"));
}

export async function getSubject(id: string): Promise<Subject | null> {
  return SUBJECTS.find((s) => s.id === id) ?? null;
}

export interface EventQuery {
  from?: string;
  to?: string;
  subjectId?: string;
  types?: EventType[];
  includeCompleted?: boolean;
}

export async function getEvents(query: EventQuery = {}): Promise<AcademicEvent[]> {
  const { from, to, subjectId, types, includeCompleted = true } = query;
  return allEvents()
    .filter((e) => {
      if (subjectId && e.subjectId !== subjectId) return false;
      if (types && !types.includes(e.type)) return false;
      if (!includeCompleted && e.status === "completed") return false;
      const instant = e.dueAt ?? e.startAt;
      if (from && instant && instant < from) return false;
      if (to && instant && instant > to) return false;
      return true;
    })
    .sort((a, b) => {
      const ai = a.dueAt ?? a.startAt ?? "";
      const bi = b.dueAt ?? b.startAt ?? "";
      return ai.localeCompare(bi);
    });
}

export interface NewEventInput {
  type: Exclude<EventType, "class">;
  title: string;
  subjectId: string | null;
  description: string | null;
  /** UTC ISO instant (assignments: the deadline; others: the start). */
  instant: string;
  /** True when no time-of-day was given. */
  allDay: boolean;
}

export async function createEvent(input: NewEventInput): Promise<AcademicEvent> {
  const subject = input.subjectId
    ? SUBJECTS.find((s) => s.id === input.subjectId) ?? null
    : null;
  const nowIso = new Date().toISOString();

  const event: AcademicEvent = {
    id:
      globalThis.crypto?.randomUUID?.() ??
      `evt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    subjectId: subject?.id ?? null,
    subject: subject
      ? { id: subject.id, name: subject.name, color: subject.color }
      : null,
    type: input.type,
    title: input.title,
    description: input.description,
    startAt: input.type === "assignment" ? null : input.instant,
    endAt: null,
    dueAt: input.type === "assignment" ? input.instant : null,
    allDay: input.allDay,
    status: "pending",
    source: "manual",
    externalId: null,
    createdAt: nowIso,
    updatedAt: nowIso,
  };

  addEvent(event);
  return event;
}

export async function setEventStatus(
  id: string,
  status: "pending" | "completed",
): Promise<void> {
  updateEventStatus(id, status);
}
