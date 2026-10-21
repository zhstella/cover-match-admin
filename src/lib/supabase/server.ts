import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { requireSupabaseConfig } from "@/lib/supabase/config";

export async function createSessionClient() {
  const cookieStore = await cookies();
  const { url, anonKey } = requireSupabaseConfig();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components cannot write cookies. Proxy handles refreshes.
        }
      },
    },
  });
}
