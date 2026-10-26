"use server";

import { revalidatePath } from "next/cache";
import { requireSuperadmin } from "@/lib/auth";
import { checkboxValue, requireId, textValue } from "@/lib/form-values";
import { createAdminClient } from "@/lib/supabase/admin";

function refresh() { revalidatePath("/access"); }
function domainValues(formData: FormData) { const domain = textValue(formData,"domain",255).toLowerCase().replace(/^@/,""); if(!/^[a-z0-9.-]+\.[a-z]{2,}$/.test(domain)) throw new Error("Enter a valid domain."); return {domain,is_active:checkboxValue(formData,"isActive")}; }
function emailValues(formData: FormData) { const email=textValue(formData,"email",320).toLowerCase(); if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new Error("Enter a valid email."); return {email,note:textValue(formData,"note",400),is_active:checkboxValue(formData,"isActive")}; }
export async function createDomain(formData:FormData){await requireSuperadmin();const{error}=await createAdminClient().from("allowed_signup_domains").insert(domainValues(formData));if(error)throw new Error(error.message);refresh();}
export async function updateDomain(id:string,formData:FormData){await requireSuperadmin();requireId(id);const{error}=await createAdminClient().from("allowed_signup_domains").update({...domainValues(formData),updated_at:new Date().toISOString()}).eq("id",id);if(error)throw new Error(error.message);refresh();}
export async function deleteDomain(id:string){await requireSuperadmin();requireId(id);const{error}=await createAdminClient().from("allowed_signup_domains").delete().eq("id",id);if(error)throw new Error(error.message);refresh();}
export async function createEmail(formData:FormData){await requireSuperadmin();const{error}=await createAdminClient().from("whitelisted_emails").insert(emailValues(formData));if(error)throw new Error(error.message);refresh();}
export async function updateEmail(id:string,formData:FormData){await requireSuperadmin();requireId(id);const{error}=await createAdminClient().from("whitelisted_emails").update({...emailValues(formData),updated_at:new Date().toISOString()}).eq("id",id);if(error)throw new Error(error.message);refresh();}
export async function deleteEmail(id:string){await requireSuperadmin();requireId(id);const{error}=await createAdminClient().from("whitelisted_emails").delete().eq("id",id);if(error)throw new Error(error.message);refresh();}
