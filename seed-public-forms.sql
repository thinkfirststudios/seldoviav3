-- ============================================================================
-- PUBLIC FORM SUBMISSIONS  (run once in Supabase → SQL Editor)
-- ----------------------------------------------------------------------------
-- Why: visitors are ANONYMOUS. Our tables were "public read / auth write", so
-- anonymous inserts hit RLS and failed (Postgres error 42501). That's why the
-- Contact form and the "Add your listing" form couldn't submit. These policies
-- let the public INSERT (submit) only — they still can't read/edit anyone's
-- data. Admin (authenticated Jenny) keeps full access.
-- ============================================================================

-- 1) CONTACT MESSAGES — allow anonymous submit -------------------------------
alter table public.messages enable row level security;
drop policy if exists "anon can submit messages" on public.messages;
create policy "anon can submit messages" on public.messages
  for insert to anon with check (true);

-- 2) COMMUNITY DIRECTORY SUBMISSIONS — new table, pending Jenny's review ------
create table if not exists public.directory_submissions (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz default now(),
  listing_type text,
  display_name text,
  photo_url    text,
  data         jsonb,                 -- every field from the form
  status       text default 'pending'
);
alter table public.directory_submissions enable row level security;

drop policy if exists "anon can submit directory" on public.directory_submissions;
create policy "anon can submit directory" on public.directory_submissions
  for insert to anon with check (true);

drop policy if exists "auth manages directory" on public.directory_submissions;
create policy "auth manages directory" on public.directory_submissions
  for all to authenticated using (true) with check (true);

-- 3) PUBLIC UPLOADS BUCKET — for the attached photo / flier ------------------
insert into storage.buckets (id, name, public)
  values ('uploads', 'uploads', true)
  on conflict (id) do nothing;

drop policy if exists "anon can upload to uploads" on storage.objects;
create policy "anon can upload to uploads" on storage.objects
  for insert to anon with check (bucket_id = 'uploads');

drop policy if exists "public can read uploads" on storage.objects;
create policy "public can read uploads" on storage.objects
  for select to public using (bucket_id = 'uploads');
