"use server";

import { revalidatePath } from "next/cache";
import { requireSuperadmin } from "@/lib/auth";
import { checkboxValue, optionalUrl, requireId, textValue } from "@/lib/form-values";
import { createAdminClient } from "@/lib/supabase/admin";

function values(formData: FormData) {
  const title = textValue(formData, "title", 160);
  const prompt = textValue(formData, "prompt", 4000);
  if (!title || !prompt) throw new Error("Title and prompt are required.");
  return { title, prompt, output_url: optionalUrl(textValue(formData, "outputUrl", 2000)), notes: textValue(formData, "notes", 1200), is_featured: checkboxValue(formData, "isFeatured") };
}

export async function createExample(formData: FormData) {
  await requireSuperadmin();
  const { error } = await createAdminClient().from("ai_generation_examples").insert(values(formData));
  if (error) throw new Error(error.message);
  revalidatePath("/examples");
}
export async function updateExample(id: string, formData: FormData) {
  await requireSuperadmin(); requireId(id);
  const { error } = await createAdminClient().from("ai_generation_examples").update({ ...values(formData), updated_at: new Date().toISOString() }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/examples");
}
export async function deleteExample(id: string) {
  await requireSuperadmin(); requireId(id);
  const { error } = await createAdminClient().from("ai_generation_examples").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/examples");
}
