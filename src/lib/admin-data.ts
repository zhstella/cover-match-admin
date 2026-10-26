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

export async function getPromptStudioData() {
  const supabase = createAdminClient();
  const [chains, steps, mixes] = await Promise.all([
    supabase.from("prompt_chains").select("*").order("created_at", { ascending: false }),
    supabase.from("prompt_chain_steps").select("*").order("position", { ascending: true }),
    supabase.from("prompt_chain_mix").select("*").order("updated_at", { ascending: false }),
  ]);

  const error = chains.error ?? steps.error ?? mixes.error;
  if (error) throw new Error(error.message);

  return {
    chains: chains.data ?? [],
    steps: steps.data ?? [],
    mixes: mixes.data ?? [],
  };
}

export async function getTerms() {
  const { data, error } = await createAdminClient()
    .from("terms")
    .select("*")
    .order("term", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getObservabilityData() {
  const supabase = createAdminClient();
  const [requests, responses, authData] = await Promise.all([
    supabase.from("generation_requests").select("*").order("created_at", { ascending: false }).limit(250),
    supabase.from("llm_responses").select("*").order("created_at", { ascending: false }).limit(250),
    supabase.auth.admin.listUsers({ page: 1, perPage: 1000 }),
  ]);
  const error = requests.error ?? responses.error ?? authData.error;
  if (error) throw new Error(error.message);

  const emails = new Map(authData.data.users.map((user) => [user.id, user.email ?? "Unknown user"]));
  return {
    requests: (requests.data ?? []).map((request) => ({
      ...request,
      email: emails.get(request.user_id) ?? "Unknown user",
    })),
    responses: responses.data ?? [],
  };
}

export async function getExamples() {
  const { data, error } = await createAdminClient()
    .from("ai_generation_examples")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getModelCatalog() {
  const supabase = createAdminClient();
  const [providers, models] = await Promise.all([
    supabase.from("llm_providers").select("*").order("name", { ascending: true }),
    supabase.from("llm_models").select("*").order("name", { ascending: true }),
  ]);
  const error = providers.error ?? models.error;
  if (error) throw new Error(error.message);
  return { providers: providers.data ?? [], models: models.data ?? [] };
}

export async function getAccessRules() {
  const supabase = createAdminClient();
  const [domains, emails] = await Promise.all([
    supabase.from("allowed_signup_domains").select("*").order("domain", { ascending: true }),
    supabase.from("whitelisted_emails").select("*").order("email", { ascending: true }),
  ]);
  const error = domains.error ?? emails.error;
  if (error) throw new Error(error.message);
  return { domains: domains.data ?? [], emails: emails.data ?? [] };
}

export async function getAdminImages() {
  const { data, error } = await createAdminClient()
    .from("admin_images")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}
