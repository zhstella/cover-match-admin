"use server";

import { revalidatePath } from "next/cache";

import { requireSuperadmin } from "@/lib/auth";
import { requireId, textValue } from "@/lib/form-values";
import { createAdminClient } from "@/lib/supabase/admin";

export async function updatePromptMix(id: string, formData: FormData) {
  await requireSuperadmin();
  requireId(id);

  const systemWeight = Number(formData.get("systemWeight"));
  const contextWeight = Number(formData.get("contextWeight"));
  const userWeight = Number(formData.get("userWeight"));
  const weights = [systemWeight, contextWeight, userWeight];
  if (weights.some((value) => !Number.isInteger(value) || value < 0 || value > 100)) {
    throw new Error("Each prompt weight must be a whole number from 0 to 100.");
  }
  if (weights.reduce((sum, value) => sum + value, 0) !== 100) {
    throw new Error("Prompt mix weights must total 100.");
  }

  const { error } = await createAdminClient()
    .from("prompt_chain_mix")
    .update({
      system_weight: systemWeight,
      context_weight: contextWeight,
      user_weight: userWeight,
      notes: textValue(formData, "notes", 600),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/prompt-studio");
}
