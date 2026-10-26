"use server";

import { revalidatePath } from "next/cache";
import { requireSuperadmin } from "@/lib/auth";
import { checkboxValue, optionalUrl, requireId, textValue } from "@/lib/form-values";
import { createAdminClient } from "@/lib/supabase/admin";

function refresh() { revalidatePath("/models"); }
function providerValues(formData: FormData) {
  const name = textValue(formData, "name", 100); const slug = textValue(formData, "slug", 100).toLowerCase();
  if (!name || !/^[a-z0-9-]+$/.test(slug)) throw new Error("Provider name and a lowercase slug are required.");
  return { name, slug, website_url: optionalUrl(textValue(formData, "websiteUrl", 2000)), is_active: checkboxValue(formData, "isActive") };
}
function modelValues(formData: FormData) {
  const providerId = textValue(formData, "providerId", 40); requireId(providerId);
  const name = textValue(formData, "name", 120); const modelKey = textValue(formData, "modelKey", 160); const modality = textValue(formData, "modality", 20);
  if (!name || !modelKey || !["text", "image", "multimodal", "audio", "video"].includes(modality)) throw new Error("Complete all model fields.");
  return { provider_id: providerId, name, model_key: modelKey, modality, is_active: checkboxValue(formData, "isActive") };
}
export async function createProvider(formData: FormData) { await requireSuperadmin(); const { error } = await createAdminClient().from("llm_providers").insert(providerValues(formData)); if (error) throw new Error(error.message); refresh(); }
export async function updateProvider(id: string, formData: FormData) { await requireSuperadmin(); requireId(id); const { error } = await createAdminClient().from("llm_providers").update({ ...providerValues(formData), updated_at: new Date().toISOString() }).eq("id", id); if (error) throw new Error(error.message); refresh(); }
export async function deleteProvider(id: string) { await requireSuperadmin(); requireId(id); const { error } = await createAdminClient().from("llm_providers").delete().eq("id", id); if (error) throw new Error(error.message); refresh(); }
export async function createModel(formData: FormData) { await requireSuperadmin(); const { error } = await createAdminClient().from("llm_models").insert(modelValues(formData)); if (error) throw new Error(error.message); refresh(); }
export async function updateModel(id: string, formData: FormData) { await requireSuperadmin(); requireId(id); const { error } = await createAdminClient().from("llm_models").update({ ...modelValues(formData), updated_at: new Date().toISOString() }).eq("id", id); if (error) throw new Error(error.message); refresh(); }
export async function deleteModel(id: string) { await requireSuperadmin(); requireId(id); const { error } = await createAdminClient().from("llm_models").delete().eq("id", id); if (error) throw new Error(error.message); refresh(); }
