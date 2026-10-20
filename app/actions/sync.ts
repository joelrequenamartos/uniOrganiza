"use server";

import { revalidatePath } from "next/cache";
import { syncUniversityCalendar } from "@/lib/data";
import type { ActionResult } from "./events";

export async function syncCalendarAction(): Promise<ActionResult> {
  try {
    await syncUniversityCalendar();
  } catch (err) {
    console.error("[calendar sync] manual sync failed:", err);
    return {
      ok: false,
      error: "No se pudo sincronizar. Inténtalo de nuevo en un momento.",
    };
  }
  revalidatePath("/", "layout");
  return { ok: true };
}
