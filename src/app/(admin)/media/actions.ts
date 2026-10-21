"use server";

import { revalidatePath } from "next/cache";

import { requireSuperadmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function textValue(formData: FormData, key: string, max: number) {
  return String(formData.get(key) ?? "").trim().slice(0, max);
}

async function bookFor(formData: FormData) {
  const bookId = Number(formData.get("bookId"));
  if (!Number.isSafeInteger(bookId) || bookId < 1) {
    throw new Error("Choose a valid book.");
  }

  const supabase = createAdminClient();
  const { data: book, error } = await supabase
    .from("favorite_books")
    .select("id, title")
    .eq("id", bookId)
    .single<{ id: number; title: string }>();

  if (error || !book) {
    throw new Error("The selected book no longer exists.");
  }

  return book;
}

export async function createMedia(formData: FormData) {
  const { user } = await requireSuperadmin();
  const book = await bookFor(formData);
  const imageUrl = textValue(formData, "imageUrl", 2000);
  const prompt = textValue(formData, "prompt", 1200);
  const creatorPrompt = textValue(formData, "creatorPrompt", 360);
  const model = textValue(formData, "model", 100) || "admin-import";

  if (!imageUrl.startsWith("https://") || !prompt) {
    throw new Error("A secure image URL and generation prompt are required.");
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from("generations").insert({
    user_id: user.id,
    book_id: book.id,
    book_title: book.title,
    prompt,
    creator_prompt: creatorPrompt || null,
    image_url: imageUrl,
    image_path: `admin/external/${crypto.randomUUID()}`,
    model,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/");
  revalidatePath("/media");
}

export async function updateMedia(id: string, formData: FormData) {
  await requireSuperadmin();
  if (!uuidPattern.test(id)) {
    throw new Error("Invalid media record.");
  }

  const book = await bookFor(formData);
  const imageUrl = textValue(formData, "imageUrl", 2000);
  const prompt = textValue(formData, "prompt", 1200);
  const creatorPrompt = textValue(formData, "creatorPrompt", 360);
  const model = textValue(formData, "model", 100) || "admin-import";

  if (!imageUrl.startsWith("https://") || !prompt) {
    throw new Error("A secure image URL and generation prompt are required.");
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("generations")
    .update({
      book_id: book.id,
      book_title: book.title,
      prompt,
      creator_prompt: creatorPrompt || null,
      image_url: imageUrl,
      model,
    })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/");
  revalidatePath("/media");
}

export async function deleteMedia(id: string) {
  await requireSuperadmin();
  if (!uuidPattern.test(id)) {
    throw new Error("Invalid media record.");
  }

  const supabase = createAdminClient();
  const { data: record } = await supabase
    .from("generations")
    .select("image_path")
    .eq("id", id)
    .maybeSingle<{ image_path: string }>();

  const { error } = await supabase.from("generations").delete().eq("id", id);
  if (error) {
    throw new Error(error.message);
  }

  if (record?.image_path && !record.image_path.startsWith("admin/external/")) {
    const { error: storageError } = await supabase.storage
      .from("book-art")
      .remove([record.image_path]);
    if (storageError) {
      console.error("Orphaned storage object:", storageError.message);
    }
  }

  revalidatePath("/");
  revalidatePath("/media");
}
