/**
 * TEMPORARY in-memory event store.
 *
 * Holds the fixture events plus anything created through the app during this
 * server process. It is NOT persisted — restarting the dev server resets it.
 * Phase 10 replaces this module with Supabase queries; the data-access API in
 * ./index.ts stays the same.
 */
import type { AcademicEvent } from "@/types/domain";
import { EVENTS } from "./fixtures";

let events: AcademicEvent[] = EVENTS.map((e) => ({ ...e }));

export function allEvents(): AcademicEvent[] {
  return events;
}

export function addEvent(event: AcademicEvent): void {
  events = [...events, event];
}

export function updateEventStatus(
  id: string,
  status: AcademicEvent["status"],
): AcademicEvent | null {
  const found = events.find((e) => e.id === id);
  if (!found) return null;
  if (found.source === "university") return found; // read-only, ignore
  found.status = status;
  found.updatedAt = new Date().toISOString();
  return found;
}
