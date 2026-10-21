import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";

import { createAdminClient } from "@/lib/supabase/admin";
import { createSessionClient } from "@/lib/supabase/server";

export type AdminProfile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  is_superadmin: boolean;
};

export const getAdminSession = cache(async () => {
  const sessionClient = await createSessionClient();
  const {
    data: { user },
  } = await sessionClient.auth.getUser();

  if (!user) {
    return null;
  }

  const adminClient = createAdminClient();
  const { data: profile, error } = await adminClient
    .from("profiles")
    .select("id, first_name, last_name, avatar_url, is_superadmin")
    .eq("id", user.id)
    .maybeSingle<AdminProfile>();

  if (error || !profile?.is_superadmin) {
    return { user, profile: null };
  }

  return { user, profile };
});

export async function requireSuperadmin() {
  const session = await getAdminSession();

  if (!session) {
    redirect("/login");
  }

  if (!session.profile) {
    redirect("/forbidden");
  }

  return { user: session.user, profile: session.profile };
}
