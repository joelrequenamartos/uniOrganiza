"use server";

import { revalidatePath } from "next/cache";
import { createEvent, setEventStatus } from "@/lib/data";
import {
  createEventSchema,
  updateEventStatusSchema,
} from "@/lib/validation/event";
import { DEFAULT_TIMEZONE, localDateTimeToIso } from "@/lib/dates";

export type ActionResult =
  | { ok: true }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

export async function createEventAction(
  input: unknown,
): Promise<ActionResult> {
  const parsed = createEventSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && !fieldErrors[key]) {
        fieldErrors[key] = issue.message;
      }
    }
    return { ok: false, error: "Revisa los campos.", fieldErrors };
  }

  const { type, title, subjectId, description, date, time } = parsed.data;
  const tz = DEFAULT_TIMEZONE;

  try {
    await createEvent({
      type,
      title,
      subjectId,
      description,
      instant: localDateTimeToIso(date, time, tz),
      allDay: time === null,
    });
  } catch {
    return { ok: false, error: "No se pudo guardar. Inténtalo de nuevo." };
  }

  revalidatePath("/", "layout");
  return { ok: true };
}

export async function setEventStatusAction(
  input: unknown,
): Promise<ActionResult> {
  const parsed = updateEventStatusSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Datos inválidos." };
  }

  try {
    await setEventStatus(parsed.data.id, parsed.data.status);
  } catch {
    return { ok: false, error: "No se pudo actualizar." };
  }

  revalidatePath("/", "layout");
  return { ok: true };
}
