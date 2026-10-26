# Cover Match Admin

A separate, protected Next.js admin application for the Cover Match Supabase project.

## Security model

1. Every non-auth route requires a valid Supabase Google session.
2. Every admin layout render and every mutation calls `requireSuperadmin()`.
3. `requireSuperadmin()` checks `profiles.is_superadmin` using a server-only Supabase service-role client.
4. `SUPABASE_SERVICE_ROLE_KEY` is never exposed to client components and is ignored by Git.

Run `supabase/week6_admin.sql` once before signing in. For Week 7, also run
`supabase/week7_observability.sql`; it is idempotent and can be safely rerun.

## Week 7 coverage

- Read users and profiles.
- Read prompt chains and their ordered steps; update prompt-chain mix weights.
- CRUD terms, AI generation examples, LLM providers, LLM models, allowed signup
  domains, and whitelisted email addresses.
- Read AI-generated media, ratings, generation requests, and LLM responses.
- CRUD an admin image library, including uploads to the `admin-images` bucket.
- Every route and every Server Action verifies the Google session and
  `profiles.is_superadmin = true` before accessing the service-role client.

The public Cover Match app writes best-effort request and response telemetry.
Observability failures are logged without blocking the core image-generation flow.

## Environment variables

Copy `.env.example` to `.env.local` and provide:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## Commands

```bash
npm install
npm run dev
npm run lint
npm run build
```
