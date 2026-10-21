"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { createSessionClient } from "@/lib/supabase/server";

export async function signInWithGoogle() {
  const headerStore = await headers();
  const origin = headerStore.get("origin") ?? "http://localhost:3000";
  const supabase = await createSessionClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback`,
      queryParams: { prompt: "select_account" },
    },
  });

  if (error || !data.url) {
    redirect("/login?error=oauth");
  }

  redirect(data.url);
}

export async function signOut() {
  const supabase = await createSessionClient();
  await supabase.auth.signOut();
  redirect("/login");
}
