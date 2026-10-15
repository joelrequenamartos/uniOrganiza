/**
 * ICS feed provider: downloads the university's iCalendar feed and parses it.
 */
import { DEFAULT_TIMEZONE } from "@/lib/dates";
import { parseIcs } from "./ics-parser";
import type {
  CalendarConnection,
  CalendarProvider,
  FetchResult,
} from "./types";

export class IcsProvider implements CalendarProvider {
  readonly kind = "ics" as const;

  async fetchEvents(connection: CalendarConnection): Promise<FetchResult> {
    if (!connection.url) throw new Error("ICS connection has no URL.");
    const res = await fetch(connection.url, {
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) throw new Error(`ICS feed responded ${res.status}.`);
    const events = parseIcs(await res.text(), DEFAULT_TIMEZONE);
    return { events, nextSyncState: null };
  }
}
