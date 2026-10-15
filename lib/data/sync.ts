/**
 * University calendar sync. The feed URL (it embeds a private token) comes from
 * the UNIVERSITY_ICS_URL env var — never commit it.
 *
 * The store is in-memory, so the sync runs lazily: at most once per TTL, on the
 * first read after it expires. Failures keep whatever was synced before.
 */
import { getCalendarProvider, type ExternalEvent } from "@/lib/calendar";
import type { AcademicEvent, EventType } from "@/types/domain";
import { SUBJECTS } from "./fixtures";
import { replaceUniversityEvents } from "./store";

const TTL_MS = 15 * 60 * 1000;
const RETRY_MS = 60 * 1000;

let nextSyncAt = 0;
let inFlight: Promise<void> | null = null;

export function ensureSynced(): Promise<void> {
  if (Date.now() < nextSyncAt) return Promise.resolve();
  inFlight ??= sync().finally(() => {
    inFlight = null;
  });
  return inFlight;
}

async function sync(): Promise<void> {
  const url = process.env.UNIVERSITY_ICS_URL;
  if (!url) {
    nextSyncAt = Date.now() + TTL_MS;
    return;
  }
  try {
    const { events } = await getCalendarProvider("ics").fetchEvents({
      id: "university",
      kind: "ics",
      url,
      name: "Universidad",
      lastSyncedAt: null,
      syncState: null,
    });
    replaceUniversityEvents(events.map(toAcademicEvent));
    nextSyncAt = Date.now() + TTL_MS;
  } catch (err) {
    console.error("[calendar sync] failed:", err);
    nextSyncAt = Date.now() + RETRY_MS;
  }
}

function classify(title: string): EventType {
  if (/^examen/i.test(title)) return "exam";
  if (/^(clase|sesi[oó]n)\b/i.test(title)) return "class";
  return "activity";
}

function toAcademicEvent(e: ExternalEvent): AcademicEvent {
  const code = e.subjectHint?.match(/_(\d{5}):/)?.[1];
  const subject = code ? SUBJECTS.find((s) => s.externalRef === code) : undefined;
  const now = new Date().toISOString();
  return {
    id: `uni-${e.uid}`,
    subjectId: subject?.id ?? null,
    subject: subject
      ? { id: subject.id, name: subject.name, color: subject.color }
      : null,
    type: classify(e.title),
    title: e.title,
    description: subject ? null : e.description,
    startAt: e.startAt,
    endAt: e.endAt,
    dueAt: null,
    allDay: e.allDay,
    status: "read_only",
    source: "university",
    externalId: e.uid,
    createdAt: now,
    updatedAt: now,
  };
}
