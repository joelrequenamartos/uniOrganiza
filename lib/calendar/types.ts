/**
 * External calendar abstraction.
 *
 * The university will provide *some* feed (ICS URL, Google Calendar, ...).
 * We don't know which yet, so every concrete integration implements this
 * interface and the rest of the app only ever sees `ExternalEvent`s.
 *
 * Nothing here touches OAuth or the network yet — Phase 9 fills in providers.
 */

export type ExternalProviderKind = "ics" | "google";

/** A raw event as read from an external source, before it becomes an app event. */
export interface ExternalEvent {
  /** Stable unique id from the source (ICS UID, Google event id). Used for idempotent sync. */
  uid: string;
  title: string;
  description: string | null;
  /** UTC ISO. */
  startAt: string;
  /** UTC ISO. */
  endAt: string | null;
  allDay: boolean;
  location: string | null;
  /** Best-effort subject name parsed from the event (title, category...). */
  subjectHint: string | null;
  /** Source revision marker if the provider exposes one (ICS SEQUENCE, etag...). */
  revision: string | null;
}

export interface CalendarConnection {
  id: string;
  kind: ExternalProviderKind;
  url: string | null;
  name: string | null;
  lastSyncedAt: string | null;
  syncState: Record<string, unknown> | null;
}

export interface FetchResult {
  events: ExternalEvent[];
  /** Opaque state to persist and pass back next sync (sync token, etag...). */
  nextSyncState: Record<string, unknown> | null;
}

export interface CalendarProvider {
  readonly kind: ExternalProviderKind;
  /**
   * Fetch the current set of events for a connection.
   * Implementations may use `connection.syncState` for incremental sync.
   */
  fetchEvents(connection: CalendarConnection): Promise<FetchResult>;
}
