"use server";

import { revalidatePath } from "next/cache";
import { requireSuperadmin } from "@/lib/auth";
import { requireId, textValue } from "@/lib/form-values";
import { createAdminClient } from "@/lib/supabase/admin";

const allowed = new Map([["image/jpeg","jpg"],["image/png","png"],["image/webp","webp"],["image/gif","gif"]]);
const maxBytes = 8 * 1024 * 1024;

function getFile(formData: FormData, required: boolean) {
  const value = formData.get("image");
  if (!(value instanceof File) || value.size === 0) {
    if (required) throw new Error("Choose an image to upload.");
    return null;
  }
  if (!allowed.has(value.type) || value.size > maxBytes) throw new Error("Upload a JPG, PNG, WebP, or GIF no larger than 8 MB.");
  return value;
}

async function upload(file: File, userId: string) {
  const supabase = createAdminClient();
  const path = `${userId}/${crypto.randomUUID()}.${allowed.get(file.type)}`;
  const { error } = await supabase.storage.from("admin-images").upload(path, Buffer.from(await file.arrayBuffer()), { contentType: file.type, cacheControl: "31536000", upsert: false });
  if (error) throw new Error(error.message);
  return { path, url: supabase.storage.from("admin-images").getPublicUrl(path).data.publicUrl };
}

export async function createImage(formData: FormData) {
  const { user } = await requireSuperadmin(); const file = getFile(formData, true)!;
  const name = textValue(formData,"name",160) || file.name.slice(0,160); const altText=textValue(formData,"altText",300);
  const stored = await upload(file,user.id); const supabase=createAdminClient();
  const { error }=await supabase.from("admin_images").insert({name,alt_text:altText,storage_path:stored.path,public_url:stored.url,mime_type:file.type,size_bytes:file.size,created_by:user.id});
  if(error){await supabase.storage.from("admin-images").remove([stored.path]);throw new Error(error.message);} revalidatePath("/images");
}

export async function updateImage(id:string,formData:FormData){
  const {user}=await requireSuperadmin();requireId(id);const supabase=createAdminClient();const{data:current,error:readError}=await supabase.from("admin_images").select("storage_path,name").eq("id",id).single();if(readError||!current)throw new Error("Image record not found.");
  const file=getFile(formData,false);const name=textValue(formData,"name",160)||current.name;const altText=textValue(formData,"altText",300);let replacement:null|{path:string;url:string}=null;
  if(file)replacement=await upload(file,user.id);
  const payload:Record<string,unknown>={name,alt_text:altText,updated_at:new Date().toISOString()};if(file&&replacement)Object.assign(payload,{storage_path:replacement.path,public_url:replacement.url,mime_type:file.type,size_bytes:file.size});
  const{error}=await supabase.from("admin_images").update(payload).eq("id",id);if(error){if(replacement)await supabase.storage.from("admin-images").remove([replacement.path]);throw new Error(error.message);}if(replacement)await supabase.storage.from("admin-images").remove([current.storage_path]);revalidatePath("/images");
}

export async function deleteImage(id:string){await requireSuperadmin();requireId(id);const supabase=createAdminClient();const{data,error:readError}=await supabase.from("admin_images").select("storage_path").eq("id",id).single();if(readError||!data)throw new Error("Image record not found.");const{error}=await supabase.from("admin_images").delete().eq("id",id);if(error)throw new Error(error.message);const{error:storageError}=await supabase.storage.from("admin-images").remove([data.storage_path]);if(storageError)console.error("Orphaned admin image",storageError.message);revalidatePath("/images");}
