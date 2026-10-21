import "server-only";

import { createClient } from "@supabase/supabase-js";

import { requireAdminConfig } from "@/lib/supabase/config";

export function createAdminClient() {
  const { url, serviceRoleKey } = requireAdminConfig();

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
