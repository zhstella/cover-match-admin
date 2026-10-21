# Cover Match Admin

A separate, protected Next.js admin application for the Cover Match Supabase project.

## Security model

1. Every non-auth route requires a valid Supabase Google session.
2. Every admin layout render and every mutation calls `requireSuperadmin()`.
3. `requireSuperadmin()` checks `profiles.is_superadmin` using a server-only Supabase service-role client.
4. `SUPABASE_SERVICE_ROLE_KEY` is never exposed to client components and is ignored by Git.

Run `supabase/week6_admin.sql` once before signing in.

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
