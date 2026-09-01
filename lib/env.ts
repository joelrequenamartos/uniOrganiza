import { z } from "zod";

/**
 * Environment access. Call `getPublicEnv()` / `getServerEnv()` where needed
 * rather than reading `process.env` directly, so a missing var fails loudly
 * with a clear message instead of a cryptic runtime error.
 */

const publicSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
});

const serverSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
});

let publicEnv: z.infer<typeof publicSchema> | null = null;
let serverEnv: z.infer<typeof serverSchema> | null = null;

export function getPublicEnv() {
  if (!publicEnv) {
    publicEnv = publicSchema.parse({
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    });
  }
  return publicEnv;
}

/** Server-only. Never import the result into a client component. */
export function getServerEnv() {
  if (!serverEnv) {
    serverEnv = serverSchema.parse({
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    });
  }
  return serverEnv;
}
