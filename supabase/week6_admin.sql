-- Week 6: superadmin authorization flag for the separate admin application.
-- Run once in the existing Cover Match Supabase project.

alter table public.profiles
add column if not exists is_superadmin boolean not null default false;

-- Ordinary users may read this value only on their own profile because the
-- existing "Users can view their own profile" policy remains in force.
-- All admin application data access uses the server-only service role after
-- verifying the signed-in user's profile has is_superadmin = true.

-- Bootstrap the first administrator by replacing the email below and running
-- this block in the Supabase SQL Editor. The service-role SQL editor is the
-- trusted out-of-band tool that prevents the initial lockout.
update public.profiles
set is_superadmin = true,
    updated_at = now()
where id = (
  select id from auth.users where email = 'yz5133@columbia.edu' limit 1
);
