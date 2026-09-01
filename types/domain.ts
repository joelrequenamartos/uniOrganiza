/**
 * Domain types — the shapes the UI and business logic work with.
 * These are decoupled from the raw Supabase row types (types/database.ts),
 * mapped at the data-access layer (lib/data/*).
 */

export type EventType = "class" | "assignment" | "activity" | "exam";

export type EventSource = "manual" | "university";

/** 'read_only' is reserved for imported university events. */
export type EventStatus = "pending" | "completed" | "read_only";

export interface Subject {
  id: string;
  name: string;
  color: string; // hex
  externalRef: string | null;
  createdAt: string; // ISO
}

export interface AcademicEvent {
  id: string;
  subjectId: string | null;
  subject: Pick<Subject, "id" | "name" | "color"> | null;
  type: EventType;
  title: string;
  description: string | null;
  /** Instant the event starts (classes, timed exams/activities). */
  startAt: string | null; // ISO, UTC
  /** Instant the event ends (classes). */
  endAt: string | null; // ISO, UTC
  /** Deadline instant (assignments). */
  dueAt: string | null; // ISO, UTC
  /** When true, time-of-day is not meaningful; render as a whole day. */
  allDay: boolean;
  status: EventStatus;
  source: EventSource;
  externalId: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * The single instant that matters for ordering an event on the timeline:
 * dueAt for assignments, startAt for everything else.
 */
export function eventInstant(e: AcademicEvent): string | null {
  return e.type === "assignment" ? e.dueAt ?? e.startAt : e.startAt ?? e.dueAt;
}

export type PriorityLevel =
  | "none" // > 14 days away — hidden from the alerts block
  | "low" // <= 14 days
  | "medium" // <= 7 days
  | "high" // <= 2 days
  | "max" // due/exam today
  | "overdue"; // assignment/activity past its date and still pending

export interface PrioritizedEvent {
  event: AcademicEvent;
  priority: PriorityLevel;
  /** Whole days from "today" to the event (local tz). Negative = past. */
  daysUntil: number;
}
