/**
 * Minimal RFC 5545 parser — just enough for the university feed:
 * VEVENT with UID / SUMMARY / DESCRIPTION / LOCATION / DTSTART / DTEND / SEQUENCE.
 * Floating local times (no "Z", no TZID) are interpreted in `tz`.
 */
import { localDateTimeToIso } from "@/lib/dates";
import type { ExternalEvent } from "./types";

interface Prop {
  name: string;
  params: Record<string, string>;
  value: string;
}

function unfold(text: string): string[] {
  return text.replace(/\r\n|\r/g, "\n").replace(/\n[ \t]/g, "").split("\n");
}

function parseLine(line: string): Prop | null {
  const colon = line.indexOf(":");
  if (colon < 0) return null;
  const [name, ...rawParams] = line.slice(0, colon).split(";");
  const params: Record<string, string> = {};
  for (const p of rawParams) {
    const eq = p.indexOf("=");
    if (eq > 0) params[p.slice(0, eq).toUpperCase()] = p.slice(eq + 1);
  }
  return { name: name.toUpperCase(), params, value: line.slice(colon + 1) };
}

function unescapeText(v: string): string {
  return v.replace(/\\([nN,;\\])/g, (_, c: string) =>
    c === "n" || c === "N" ? "\n" : c,
  );
}

function parseDate(
  prop: Prop,
  tz: string,
): { iso: string; dateOnly: boolean } | null {
  const m = prop.value.match(/^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})?(Z)?)?$/);
  if (!m) return null;
  const [, y, mo, d, hh, mi, , z] = m;
  if (hh === undefined) {
    return { iso: localDateTimeToIso(`${y}-${mo}-${d}`, null, tz), dateOnly: true };
  }
  if (z) {
    return {
      iso: new Date(Date.UTC(+y, +mo - 1, +d, +hh, +mi)).toISOString(),
      dateOnly: false,
    };
  }
  return {
    iso: localDateTimeToIso(`${y}-${mo}-${d}`, `${hh}:${mi}`, prop.params.TZID ?? tz),
    dateOnly: false,
  };
}

export function parseIcs(text: string, tz: string): ExternalEvent[] {
  const events: ExternalEvent[] = [];
  let current: Prop[] | null = null;

  for (const line of unfold(text)) {
    if (line === "BEGIN:VEVENT") {
      current = [];
      continue;
    }
    if (line === "END:VEVENT") {
      if (current) {
        const ev = toEvent(current, tz);
        if (ev) events.push(ev);
      }
      current = null;
      continue;
    }
    if (current) {
      const p = parseLine(line);
      if (p) current.push(p);
    }
  }
  return events;
}

function toEvent(props: Prop[], tz: string): ExternalEvent | null {
  const get = (n: string) => props.find((p) => p.name === n);
  const uid = get("UID")?.value;
  const startProp = get("DTSTART");
  if (!uid || !startProp) return null;
  const start = parseDate(startProp, tz);
  if (!start) return null;
  const endProp = get("DTEND");
  const end = endProp ? parseDate(endProp, tz) : null;

  // The feed marks whole-day events as 00:00 → 23:59.
  const startsMidnight = /T000000$/.test(startProp.value);
  const endsEndOfDay = !!endProp && /T2359(00)?$/.test(endProp.value);
  const allDay = start.dateOnly || (startsMidnight && endsEndOfDay);

  const description = get("DESCRIPTION")?.value
    ? unescapeText(get("DESCRIPTION")!.value).replace(/^Descripción:\s*/, "")
    : null;

  return {
    uid,
    title: unescapeText(get("SUMMARY")?.value ?? "Sin título"),
    description,
    startAt: start.iso,
    endAt: end?.iso ?? null,
    allDay,
    location: get("LOCATION") ? unescapeText(get("LOCATION")!.value) : null,
    subjectHint: description,
    revision: get("SEQUENCE")?.value ?? null,
  };
}
