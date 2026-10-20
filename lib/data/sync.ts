/**
 * University calendar sync into Supabase.
 *
 * The feed URL (it embeds a private token) comes from the UNIVERSITY_ICS_URL
 * env var — never commit it. The last sync time lives in `external_calendars`,
 * so every server instance shares the same throttle.
 *
 * Rules: events are upserted by (source, external_id); imported events that
 * disappear from the feed are kept if already past (history), and removed if
 * still in the future (cancelled / moved).
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import { getCalendarProvider, type ExternalEvent } from "@/lib/calendar";
import type { Database } from "@/types/database";
import type { EventType } from "@/types/domain";

type Client = SupabaseClient<Database>;
type EventInsert = Database["public"]["Tables"]["events"]["Insert"];

const TTL_MS = 15 * 60 * 1000;
const RETRY_MS = 60 * 1000;

/** Per-instance backoff after a failed download, so pages don't each wait. */
let retryAfter = 0;
const inFlight = new Map<string, Promise<void>>();

export function ensureSynced(supabase: Client, userId: string): Promise<void> {
  if (!process.env.UNIVERSITY_ICS_URL || Date.now() < retryAfter) {
    return Promise.resolve();
  }
  let p = inFlight.get(userId);
  if (!p) {
    p = sync(supabase, userId)
      .catch((err) => {
        console.error("[calendar sync] failed:", err);
        retryAfter = Date.now() + RETRY_MS;
      })
      .finally(() => inFlight.delete(userId));
    inFlight.set(userId, p);
  }
  return p;
}

/**
 * Sync right now, ignoring the throttle and the failure back-off. Unlike
 * `ensureSynced` it surfaces errors so the UI can tell the user.
 */
export async function syncNow(supabase: Client, userId: string): Promise<void> {
  if (!process.env.UNIVERSITY_ICS_URL) {
    throw new Error("UNIVERSITY_ICS_URL is not configured.");
  }
  const running = inFlight.get(userId);
  if (running) await running; // let an in-progress sync finish first
  await sync(supabase, userId, true);
  retryAfter = 0;
}

async function sync(
  supabase: Client,
  userId: string,
  force = false,
): Promise<void> {
  const url = process.env.UNIVERSITY_ICS_URL!;

  const { data: cal, error: calErr } = await supabase
    .from("external_calendars")
    .select("id,last_synced_at")
    .eq("provider", "ics")
    .maybeSingle();
  if (calErr) throw calErr;
  if (
    !force &&
    cal?.last_synced_at &&
    Date.now() - new Date(cal.last_synced_at).getTime() < TTL_MS
  ) {
    return;
  }

  const { events } = await getCalendarProvider("ics").fetchEvents({
    id: cal?.id ?? "university",
    kind: "ics",
    url,
    name: "Universidad",
    lastSyncedAt: cal?.last_synced_at ?? null,
    syncState: null,
  });

  const [subjectsRes, existingRes] = await Promise.all([
    supabase.from("subjects").select("id,external_ref"),
    supabase
      .from("events")
      .select("id,external_id")
      .eq("source", "university"),
  ]);
  if (subjectsRes.error) throw subjectsRes.error;
  if (existingRes.error) throw existingRes.error;

  const subjectByRef = new Map(
    subjectsRes.data.flatMap((s) =>
      s.external_ref ? [[s.external_ref, s.id] as const] : [],
    ),
  );
  const idByExternal = new Map(
    existingRes.data.flatMap((e) =>
      e.external_id ? [[e.external_id, e.id] as const] : [],
    ),
  );

  const toInsert: EventInsert[] = [];
  const toUpdate: EventInsert[] = [];
  for (const e of events) {
    const row = toRow(e, userId, subjectByRef);
    const existingId = idByExternal.get(e.uid);
    if (existingId) {
      // Keep the user's "done" mark: never touch status on refresh.
      const rest: EventInsert = { ...row, id: existingId };
      delete rest.status;
      toUpdate.push(rest);
    } else {
      toInsert.push(row);
    }
  }

  if (toInsert.length) {
    const { error } = await supabase.from("events").insert(toInsert);
    if (error) throw error;
  }
  if (toUpdate.length) {
    const { error } = await supabase
      .from("events")
      .upsert(toUpdate, { onConflict: "id" });
    if (error) throw error;
  }

  // Cancelled / moved: gone from the feed and still upcoming. Guarded against
  // an empty feed so a bad response can't wipe the calendar.
  if (events.length > 0) {
    const stale = existingRes.data
      .filter((e) => e.external_id && !events.some((x) => x.uid === e.external_id))
      .map((e) => e.id);
    if (stale.length) {
      const { error } = await supabase
        .from("events")
        .delete()
        .in("id", stale)
        .gt("start_at", new Date().toISOString());
      if (error) throw error;
    }
  }

  const nowIso = new Date().toISOString();
  const { error } = cal
    ? await supabase
        .from("external_calendars")
        .update({ last_synced_at: nowIso })
        .eq("id", cal.id)
    : await supabase.from("external_calendars").insert({
        user_id: userId,
        provider: "ics",
        name: "Universidad",
        last_synced_at: nowIso,
      });
  if (error) throw error;
}

function classify(title: string): EventType {
  if (/^examen/i.test(title)) return "exam";
  if (/^(clase|sesi[oó]n)\b/i.test(title)) return "class";
  return "activity";
}

function toRow(
  e: ExternalEvent,
  userId: string,
  subjectByRef: Map<string, string>,
): EventInsert {
  const code = e.subjectHint?.match(/_(\d{5}):/)?.[1];
  const subjectId = code ? (subjectByRef.get(code) ?? null) : null;
  return {
    user_id: userId,
    subject_id: subjectId,
    type: classify(e.title),
    title: e.title,
    description: subjectId ? null : e.description,
    start_at: e.startAt,
    end_at: e.endAt,
    due_at: null,
    all_day: e.allDay,
    status: "read_only",
    source: "university",
    external_id: e.uid,
  };
}
