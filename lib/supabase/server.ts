import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { Database } from "@/types/database";
import { getPublicEnv } from "@/lib/env";

/**
 * Supabase client for Server Components, Route Handlers and Server Actions.
 * Reads/writes the auth session via Next's cookie store.
 */
export async function createClient() {
  const cookieStore = await cookies();
  const env = getPublicEnv();

  return createServerClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(
          cookiesToSet: {
            name: string;
            value: string;
            options: CookieOptions;
          }[],
        ) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Called from a Server Component — safe to ignore when middleware
            // is refreshing sessions.
          }
        },
      },
    },
  );
}
