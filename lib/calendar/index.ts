import type { CalendarProvider, ExternalProviderKind } from "./types";
import { IcsProvider } from "./ics-provider";

export * from "./types";

/** Resolve a provider implementation by kind. Extend as integrations land. */
export function getCalendarProvider(
  kind: ExternalProviderKind,
): CalendarProvider {
  switch (kind) {
    case "ics":
      return new IcsProvider();
    case "google":
      throw new Error("Google Calendar provider not implemented yet (Phase 9).");
    default: {
      const _exhaustive: never = kind;
      throw new Error(`Unknown calendar provider: ${String(_exhaustive)}`);
    }
  }
}
