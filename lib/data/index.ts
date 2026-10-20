/**
 * Data-access layer. The rest of the app imports only from here.
 *
 * Backed by Supabase through the request's session client, so Row Level
 * Security scopes every query to the signed-in user.
 */
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";
import type { AcademicEvent, EventType, Subject } from "@/types/domain";
import { termOf } from "@/lib/domain/subject-term";
import { ensureSynced, syncNow } from "./sync";

type SubjectRow = Database["public"]["Tables"]["subjects"]["Row"];
type EventRow = Database["public"]["Tables"]["events"]["Row"];

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function toSubject(r: SubjectRow): Subject {
  return {
    id: r.id,
    name: r.name,
    color: r.color,
    externalRef: r.external_ref,
    term: termOf(r.external_ref),
    createdAt: r.created_at,
  };
}

function toEvent(r: EventRow, subjects: Map<string, Subject>): AcademicEvent {
  const s = r.subject_id ? subjects.get(r.subject_id) : undefined;
  return {
    id: r.id,
    subjectId: r.subject_id,
    subject: s
      ? { id: s.id, name: s.name, color: s.color, term: s.term }
      : null,
    type: r.type,
    title: r.title,
    description: r.description,
    startAt: r.start_at,
    endAt: r.end_at,
    dueAt: r.due_at,
    allDay: r.all_day,
    status: r.status,
    source: r.source,
    externalId: r.external_id,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

async function requireUser() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  // Session expired or lost: send the user to sign in rather than crashing
  // the whole shell (layout errors bypass the segment error boundary).
  if (error || !data.user) redirect("/login");
  return { supabase, userId: data.user.id };
}

export async function getSubjects(): Promise<Subject[]> {
  const { supabase } = await requireUser();
  const { data, error } = await supabase.from("subjects").select("*");
  if (error) throw error;
  return data
    .map(toSubject)
    .sort((a, b) => a.name.localeCompare(b.name, "es"));
}

export async function getSubject(id: string): Promise<Subject | null> {
  if (!UUID_RE.test(id)) return null;
  const { supabase } = await requireUser();
  const { data, error } = await supabase
    .from("subjects")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? toSubject(data) : null;
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
  const { supabase, userId } = await requireUser();
  await ensureSynced(supabase, userId);

  const [subjectsRes, eventsRes] = await Promise.all([
    supabase.from("subjects").select("*"),
    supabase.from("events").select("*"),
  ]);
  if (subjectsRes.error) throw subjectsRes.error;
  if (eventsRes.error) throw eventsRes.error;
  const subjects = new Map(subjectsRes.data.map((s) => [s.id, toSubject(s)]));

  return eventsRes.data
    .map((r) => toEvent(r, subjects))
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

export async function createEvent(input: NewEventInput): Promise<void> {
  const { supabase, userId } = await requireUser();
  const isAssignment = input.type === "assignment";
  const { error } = await supabase.from("events").insert({
    user_id: userId,
    subject_id: input.subjectId,
    type: input.type,
    title: input.title,
    description: input.description,
    start_at: isAssignment ? null : input.instant,
    due_at: isAssignment ? input.instant : null,
    all_day: input.allDay,
    status: "pending",
    source: "manual",
  });
  if (error) throw error;
}

export async function setEventStatus(
  id: string,
  status: "pending" | "completed",
): Promise<void> {
  if (!UUID_RE.test(id)) throw new Error("Invalid event id.");
  const { supabase } = await requireUser();
  // Manual events toggle pending <-> completed. Imported ones keep their
  // "read_only" resting state, so undoing "done" returns to read_only.
  const manual = await supabase
    .from("events")
    .update({ status })
    .eq("id", id)
    .eq("source", "manual");
  if (manual.error) throw manual.error;
  const university = await supabase
    .from("events")
    .update({ status: status === "completed" ? "completed" : "read_only" })
    .eq("id", id)
    .eq("source", "university");
  if (university.error) throw university.error;
}

/** Pull the university calendar now and report when it last synced. */
export async function syncUniversityCalendar(): Promise<void> {
  const { supabase, userId } = await requireUser();
  await syncNow(supabase, userId);
}

export async function getLastSyncedAt(): Promise<string | null> {
  const { supabase } = await requireUser();
  const { data, error } = await supabase
    .from("external_calendars")
    .select("last_synced_at")
    .eq("provider", "ics")
    .maybeSingle();
  if (error) throw error;
  return data?.last_synced_at ?? null;
}
