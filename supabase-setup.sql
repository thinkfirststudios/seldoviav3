-- ============================================================
--  SELDOVIA.COM — database schema
--  Run this ONCE in your Supabase project:
--  Dashboard → SQL Editor → New query → paste all of this → Run.
-- ============================================================

-- 1) DAILY PHOTOS  (powers the Photo Journal / "Seldovia Today")
create table if not exists public.photos (
  id         uuid primary key default gen_random_uuid(),
  taken_on   date not null default current_date,   -- the date the photo is FOR
  caption    text,
  image_url  text not null,
  created_at timestamptz not null default now()
);

-- 2) BLOG POSTS
create table if not exists public.posts (
  id         uuid primary key default gen_random_uuid(),
  title      text not null,
  body       text,
  excerpt    text,
  category   text default 'Blog',
  post_date  date not null default current_date,
  image_url  text,
  published  boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------- Row-Level Security ----------
alter table public.photos enable row level security;
alter table public.posts  enable row level security;

-- Anyone can READ (the public website)
drop policy if exists "public read photos" on public.photos;
create policy "public read photos" on public.photos for select using (true);

drop policy if exists "public read posts" on public.posts;
create policy "public read posts" on public.posts for select using (true);

-- Only a signed-in user (Jenny) can INSERT/UPDATE/DELETE
drop policy if exists "auth write photos" on public.photos;
create policy "auth write photos" on public.photos for all
  to authenticated using (true) with check (true);

drop policy if exists "auth write posts" on public.posts;
create policy "auth write posts" on public.posts for all
  to authenticated using (true) with check (true);

-- ---------- Storage policies ----------
-- (First create two PUBLIC buckets named  gallery  and  blog  in
--  Dashboard → Storage → New bucket → tick "Public bucket".)
-- Then these let a signed-in user upload, and everyone read:
drop policy if exists "auth upload images" on storage.objects;
create policy "auth upload images" on storage.objects for insert
  to authenticated with check (bucket_id in ('gallery','blog'));

drop policy if exists "auth manage images" on storage.objects;
create policy "auth manage images" on storage.objects for all
  to authenticated using (bucket_id in ('gallery','blog')) with check (bucket_id in ('gallery','blog'));

drop policy if exists "public read images" on storage.objects;
create policy "public read images" on storage.objects for select
  using (bucket_id in ('gallery','blog'));
