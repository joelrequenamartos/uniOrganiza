/**
 * Data-access layer. The rest of the app imports only from here.
 *
 * Right now everything is served from in-memory fixtures. When Supabase is
 * wired up (final phase) each function's body is replaced with a query against
 * `createClient()` — signatures and return types stay identical.
 */
import type { AcademicEvent, Subject } from "@/types/domain";
import { EVENTS, SUBJECTS } from "./fixtures";

export const USING_FIXTURES = true;

export async function getSubjects(): Promise<Subject[]> {
  return [...SUBJECTS].sort((a, b) => a.name.localeCompare(b.name, "es"));
}

export async function getSubject(id: string): Promise<Subject | null> {
  return SUBJECTS.find((s) => s.id === id) ?? null;
}

export interface EventQuery {
  /** Inclusive ISO lower bound on the event's anchoring instant. */
  from?: string;
  /** Inclusive ISO upper bound. */
  to?: string;
  subjectId?: string;
  types?: AcademicEvent["type"][];
  /** When false, completed events are excluded. Default true. */
  includeCompleted?: boolean;
}

export async function getEvents(query: EventQuery = {}): Promise<AcademicEvent[]> {
  const { from, to, subjectId, types, includeCompleted = true } = query;
  return EVENTS.filter((e) => {
    if (subjectId && e.subjectId !== subjectId) return false;
    if (types && !types.includes(e.type)) return false;
    if (!includeCompleted && e.status === "completed") return false;
    const instant = e.dueAt ?? e.startAt;
    if (from && instant && instant < from) return false;
    if (to && instant && instant > to) return false;
    return true;
  }).sort((a, b) => {
    const ai = a.dueAt ?? a.startAt ?? "";
    const bi = b.dueAt ?? b.startAt ?? "";
    return ai.localeCompare(bi);
  });
}
