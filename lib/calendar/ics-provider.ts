/**
 * ICS feed provider — STUB.
 *
 * Implemented in Phase 9 once we know the university's feed format.
 * Kept here so the abstraction has at least one concrete shape to check against.
 */
import type {
  CalendarConnection,
  CalendarProvider,
  FetchResult,
} from "./types";

export class IcsProvider implements CalendarProvider {
  readonly kind = "ics" as const;

  async fetchEvents(_connection: CalendarConnection): Promise<FetchResult> {
    throw new Error("IcsProvider.fetchEvents not implemented yet (Phase 9).");
  }
}
