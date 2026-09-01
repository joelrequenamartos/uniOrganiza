import { z } from "zod";

/**
 * Form/action validation for user-created events (assignment | activity | exam).
 * Classes are never created by hand — they come from the university feed.
 *
 * Shared by the client form and the Server Action so validation lives in one place.
 */

export const manualEventType = z.enum(["assignment", "activity", "exam"]);
export type ManualEventType = z.infer<typeof manualEventType>;

const baseFields = {
  type: manualEventType,
  title: z.string().trim().min(1, "El nombre es obligatorio").max(200),
  subjectId: z.string().uuid().nullable().default(null),
  description: z.string().trim().max(2000).nullable().default(null),
  /** yyyy-MM-dd in the user's local tz. */
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida"),
  /** HH:mm, optional. Absent => all-day. */
  time: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "Hora inválida")
    .nullable()
    .default(null),
};

export const createEventSchema = z.object(baseFields);
export type CreateEventInput = z.infer<typeof createEventSchema>;

export const updateEventStatusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["pending", "completed"]),
});
export type UpdateEventStatusInput = z.infer<typeof updateEventStatusSchema>;
