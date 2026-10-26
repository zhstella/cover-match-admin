"use server";

import { revalidatePath } from "next/cache";

import { requireSuperadmin } from "@/lib/auth";
import { checkboxValue, requireId, textValue } from "@/lib/form-values";
import { createAdminClient } from "@/lib/supabase/admin";

function values(formData: FormData) {
  const term = textValue(formData, "term", 120);
  const definition = textValue(formData, "definition", 1200);
  const category = textValue(formData, "category", 80) || "general";
  if (!term || !definition) throw new Error("Term and definition are required.");
  return { term, definition, category, is_active: checkboxValue(formData, "isActive") };
}

export async function createTerm(formData: FormData) {
  await requireSuperadmin();
  const { error } = await createAdminClient().from("terms").insert(values(formData));
  if (error) throw new Error(error.message);
  revalidatePath("/terms");
}

export async function updateTerm(id: string, formData: FormData) {
  await requireSuperadmin();
  requireId(id);
  const { error } = await createAdminClient().from("terms").update({ ...values(formData), updated_at: new Date().toISOString() }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/terms");
}

export async function deleteTerm(id: string) {
  await requireSuperadmin();
  requireId(id);
  const { error } = await createAdminClient().from("terms").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/terms");
}
