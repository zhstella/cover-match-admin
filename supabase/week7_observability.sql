-- Week 7: administration and generation observability.
-- Safe to run more than once in the existing Cover Match Supabase project.

create extension if not exists pgcrypto;

create table if not exists public.prompt_chains (
  id uuid primary key default gen_random_uuid(),
  name text not null unique check (char_length(name) between 1 and 120),
  description text not null default '' check (char_length(description) <= 600),
  version integer not null default 1 check (version > 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.prompt_chain_steps (
  id uuid primary key default gen_random_uuid(),
  prompt_chain_id uuid not null references public.prompt_chains (id) on delete cascade,
  position integer not null check (position > 0),
  name text not null check (char_length(name) between 1 and 120),
  template text not null check (char_length(template) between 1 and 4000),
  purpose text not null default '' check (char_length(purpose) <= 600),
  created_at timestamptz not null default now(),
  unique (prompt_chain_id, position)
);

create table if not exists public.prompt_chain_mix (
  id uuid primary key default gen_random_uuid(),
  prompt_chain_id uuid not null unique references public.prompt_chains (id) on delete cascade,
  system_weight smallint not null default 40 check (system_weight between 0 and 100),
  context_weight smallint not null default 35 check (context_weight between 0 and 100),
  user_weight smallint not null default 25 check (user_weight between 0 and 100),
  notes text not null default '' check (char_length(notes) <= 600),
  updated_at timestamptz not null default now(),
  check (system_weight + context_weight + user_weight = 100)
);

create table if not exists public.terms (
  id uuid primary key default gen_random_uuid(),
  term text not null unique check (char_length(term) between 1 and 120),
  definition text not null check (char_length(definition) between 1 and 1200),
  category text not null default 'general' check (char_length(category) between 1 and 80),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.llm_providers (
  id uuid primary key default gen_random_uuid(),
  name text not null unique check (char_length(name) between 1 and 100),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  website_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.llm_models (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.llm_providers (id) on delete restrict,
  name text not null check (char_length(name) between 1 and 120),
  model_key text not null unique check (char_length(model_key) between 1 and 160),
  modality text not null default 'image' check (modality in ('text', 'image', 'multimodal', 'audio', 'video')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.generation_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  book_id bigint references public.favorite_books (id) on delete set null,
  prompt_chain_id uuid references public.prompt_chains (id) on delete set null,
  request_prompt text not null check (char_length(request_prompt) between 1 and 4000),
  user_prompt text,
  provider text not null check (char_length(provider) between 1 and 100),
  model text not null check (char_length(model) between 1 and 160),
  status text not null default 'pending' check (status in ('pending', 'processing', 'succeeded', 'failed')),
  generation_id uuid references public.generations (id) on delete set null,
  error_code text,
  error_message text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.llm_responses (
  id uuid primary key default gen_random_uuid(),
  generation_request_id uuid not null references public.generation_requests (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  provider text not null check (char_length(provider) between 1 and 100),
  model text not null check (char_length(model) between 1 and 160),
  status text not null check (status in ('succeeded', 'failed')),
  http_status integer check (http_status between 100 and 599),
  duration_ms integer check (duration_ms >= 0),
  finish_reason text,
  response_summary text,
  raw_metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.ai_generation_examples (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 160),
  prompt text not null check (char_length(prompt) between 1 and 4000),
  output_url text,
  notes text not null default '' check (char_length(notes) <= 1200),
  is_featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.allowed_signup_domains (
  id uuid primary key default gen_random_uuid(),
  domain text not null unique check (domain = lower(domain) and domain ~ '^[a-z0-9.-]+\.[a-z]{2,}$'),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.whitelisted_emails (
  id uuid primary key default gen_random_uuid(),
  email text not null unique check (email = lower(email) and email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  note text not null default '' check (char_length(note) <= 400),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_images (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 160),
  storage_path text not null unique,
  public_url text not null,
  alt_text text not null default '' check (char_length(alt_text) <= 300),
  mime_type text not null check (mime_type in ('image/jpeg', 'image/png', 'image/webp', 'image/gif')),
  size_bytes bigint not null check (size_bytes between 1 and 8388608),
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists prompt_chain_steps_chain_position_idx
  on public.prompt_chain_steps (prompt_chain_id, position);
create index if not exists generation_requests_user_created_idx
  on public.generation_requests (user_id, created_at desc);
create index if not exists generation_requests_status_created_idx
  on public.generation_requests (status, created_at desc);
create index if not exists llm_responses_request_created_idx
  on public.llm_responses (generation_request_id, created_at desc);

alter table public.prompt_chains enable row level security;
alter table public.prompt_chain_steps enable row level security;
alter table public.prompt_chain_mix enable row level security;
alter table public.terms enable row level security;
alter table public.llm_providers enable row level security;
alter table public.llm_models enable row level security;
alter table public.generation_requests enable row level security;
alter table public.llm_responses enable row level security;
alter table public.ai_generation_examples enable row level security;
alter table public.allowed_signup_domains enable row level security;
alter table public.whitelisted_emails enable row level security;
alter table public.admin_images enable row level security;

-- The public app can create and update only its signed-in user's telemetry.
grant select, insert, update on public.generation_requests to authenticated;
grant select, insert on public.llm_responses to authenticated;

drop policy if exists "Users can read their own generation requests" on public.generation_requests;
create policy "Users can read their own generation requests"
on public.generation_requests for select to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users can create their own generation requests" on public.generation_requests;
create policy "Users can create their own generation requests"
on public.generation_requests for insert to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their own generation requests" on public.generation_requests;
create policy "Users can update their own generation requests"
on public.generation_requests for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can read their own LLM responses" on public.llm_responses;
create policy "Users can read their own LLM responses"
on public.llm_responses for select to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users can create their own LLM responses" on public.llm_responses;
create policy "Users can create their own LLM responses"
on public.llm_responses for insert to authenticated
with check ((select auth.uid()) = user_id);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'admin-images',
  'admin-images',
  true,
  8388608,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Seed the production provider, model, and the chain represented by the app.
insert into public.llm_providers (name, slug, website_url)
values ('OpenAI', 'openai', 'https://openai.com')
on conflict (slug) do update set name = excluded.name, website_url = excluded.website_url;

insert into public.llm_models (provider_id, name, model_key, modality)
select id, 'GPT Image 2.5 Flare', 'gpt-image-2.5-flare', 'image'
from public.llm_providers where slug = 'openai'
on conflict (model_key) do update set name = excluded.name, provider_id = excluded.provider_id;

insert into public.prompt_chains (name, description, version, is_active)
values (
  'Book cover generation',
  'Builds an original editorial illustration from book context and optional reader direction.',
  1,
  true
)
on conflict (name) do update set description = excluded.description, is_active = excluded.is_active;

insert into public.prompt_chain_steps (prompt_chain_id, position, name, template, purpose)
select id, 1, 'Book context',
  'Create an original square editorial illustration inspired by the themes and atmosphere of the selected book.',
  'Ground the image in the selected title and author.'
from public.prompt_chains where name = 'Book cover generation'
on conflict (prompt_chain_id, position) do update set
  name = excluded.name, template = excluded.template, purpose = excluded.purpose;

insert into public.prompt_chain_steps (prompt_chain_id, position, name, template, purpose)
select id, 2, 'Reader direction',
  'Append the reader supplied direction when present.',
  'Allow a concise visual, mood, or style instruction.'
from public.prompt_chains where name = 'Book cover generation'
on conflict (prompt_chain_id, position) do update set
  name = excluded.name, template = excluded.template, purpose = excluded.purpose;

insert into public.prompt_chain_steps (prompt_chain_id, position, name, template, purpose)
select id, 3, 'Safety and originality',
  'Do not copy an existing cover, use logos, or include written words or typography.',
  'Keep output original and suitable for the public gallery.'
from public.prompt_chains where name = 'Book cover generation'
on conflict (prompt_chain_id, position) do update set
  name = excluded.name, template = excluded.template, purpose = excluded.purpose;

insert into public.prompt_chain_mix (prompt_chain_id, system_weight, context_weight, user_weight, notes)
select id, 40, 35, 25, 'Weights must total 100. Adjust how strongly each prompt source influences the compiled request.'
from public.prompt_chains where name = 'Book cover generation'
on conflict (prompt_chain_id) do nothing;
