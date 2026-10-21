import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

export type Book = {
  id: number;
  title: string;
  author: string;
};

export type MediaRecord = {
  id: string;
  user_id: string;
  book_id: number;
  book_title: string;
  prompt: string;
  creator_prompt: string | null;
  image_url: string;
  image_path: string;
  model: string;
  created_at: string;
  ratings: { score: number }[];
  comments: { id: string }[];
};

export async function getDashboardData() {
  const supabase = createAdminClient();
  const [profiles, generations, ratings, comments, recent] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("generations").select("id", { count: "exact", head: true }),
    supabase.from("ratings").select("score, created_at"),
    supabase.from("comments").select("id", { count: "exact", head: true }),
    supabase
      .from("generations")
      .select("id, book_title, image_url, model, created_at, ratings(score), comments(id)")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const scores = ratings.data?.map((rating) => rating.score) ?? [];
  const average = scores.length
    ? scores.reduce((sum, score) => sum + score, 0) / scores.length
    : 0;
  const distribution = [5, 4, 3, 2, 1].map((score) => ({
    score,
    count: scores.filter((value) => value === score).length,
  }));

  return {
    stats: {
      profiles: profiles.count ?? 0,
      generations: generations.count ?? 0,
      ratings: scores.length,
      comments: comments.count ?? 0,
      average,
    },
    distribution,
    recent: (recent.data ?? []) as Array<{
      id: string;
      book_title: string;
      image_url: string;
      model: string;
      created_at: string;
      ratings: { score: number }[];
      comments: { id: string }[];
    }>,
  };
}

export async function getProfiles() {
  const supabase = createAdminClient();
  const [{ data: profiles, error }, { data: authData, error: authError }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select(
          "id, first_name, last_name, avatar_url, is_superadmin, created_at, updated_at",
        )
        .order("created_at", { ascending: false }),
      supabase.auth.admin.listUsers({ page: 1, perPage: 1000 }),
    ]);

  if (error || authError) {
    throw new Error(error?.message ?? authError?.message ?? "Profiles failed to load.");
  }

  const usersById = new Map(authData.users.map((user) => [user.id, user]));

  return (profiles ?? []).map((profile) => ({
    ...profile,
    email: usersById.get(profile.id)?.email ?? "Email unavailable",
    lastSignInAt: usersById.get(profile.id)?.last_sign_in_at ?? null,
  }));
}

export async function getMediaData() {
  const supabase = createAdminClient();
  const [media, books] = await Promise.all([
    supabase
      .from("generations")
      .select(
        "id, user_id, book_id, book_title, prompt, creator_prompt, image_url, image_path, model, created_at, ratings(score), comments(id)",
      )
      .order("created_at", { ascending: false }),
    supabase
      .from("favorite_books")
      .select("id, title, author")
      .order("title", { ascending: true }),
  ]);

  if (media.error || books.error) {
    throw new Error(media.error?.message ?? books.error?.message ?? "Media failed to load.");
  }

  return {
    media: (media.data ?? []) as MediaRecord[],
    books: (books.data ?? []) as Book[],
  };
}

export async function getRatings() {
  const supabase = createAdminClient();
  const [{ data: ratings, error }, { data: profiles }] = await Promise.all([
    supabase
      .from("ratings")
      .select("id, generation_id, user_id, score, created_at, updated_at, generations(book_title)")
      .order("created_at", { ascending: false }),
    supabase.from("profiles").select("id, first_name, last_name"),
  ]);

  if (error) {
    throw new Error(error.message);
  }

  const names = new Map(
    (profiles ?? []).map((profile) => [
      profile.id,
      [profile.first_name, profile.last_name].filter(Boolean).join(" ") || "Reader",
    ]),
  );

  return (ratings ?? []).map((rating) => ({
    ...rating,
    readerName: names.get(rating.user_id) ?? "Reader",
  }));
}
