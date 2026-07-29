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

-- 3) BULLETIN BOARD (community notices; each can link to a flyer/landing page)
create table if not exists public.bulletin (
  id         uuid primary key default gen_random_uuid(),
  category   text default 'Notice',
  title      text not null,
  body       text,
  posted_by  text,
  link       text,                                  -- optional flyer / landing-page URL
  starts_on  date,
  published  boolean not null default true,
  created_at timestamptz not null default now()
);

-- 4) REAL ESTATE LISTINGS
create table if not exists public.listings (
  id          uuid primary key default gen_random_uuid(),
  slug        text,
  address     text not null,
  city        text default 'Seldovia, AK 99663',
  price       text,
  beds        text,
  baths       text,
  sqft        text,
  status      text default 'For Sale',
  listed_on   date default current_date,            -- Jenny: the date matters
  description text,
  image_url   text,                                 -- primary photo
  photos      jsonb default '[]'::jsonb,            -- additional photo URLs
  video_url   text,
  published   boolean not null default true,
  created_at  timestamptz not null default now()
);

-- ---------- Row-Level Security ----------
alter table public.photos   enable row level security;
alter table public.posts    enable row level security;
alter table public.bulletin enable row level security;
alter table public.listings enable row level security;

drop policy if exists "public read bulletin" on public.bulletin;
create policy "public read bulletin" on public.bulletin for select using (true);
drop policy if exists "auth write bulletin" on public.bulletin;
create policy "auth write bulletin" on public.bulletin for all to authenticated using (true) with check (true);

drop policy if exists "public read listings" on public.listings;
create policy "public read listings" on public.listings for select using (true);
drop policy if exists "auth write listings" on public.listings;
create policy "auth write listings" on public.listings for all to authenticated using (true) with check (true);

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
-- (Create three PUBLIC buckets named  gallery ,  blog , and  listings  in
--  Dashboard → Storage → New bucket → tick "Public bucket".)
-- Then these let a signed-in user upload, and everyone read:
drop policy if exists "auth upload images" on storage.objects;
create policy "auth upload images" on storage.objects for insert
  to authenticated with check (bucket_id in ('gallery','blog','listings'));

drop policy if exists "auth manage images" on storage.objects;
create policy "auth manage images" on storage.objects for all
  to authenticated using (bucket_id in ('gallery','blog','listings')) with check (bucket_id in ('gallery','blog','listings'));

drop policy if exists "public read images" on storage.objects;
create policy "public read images" on storage.objects for select
  using (bucket_id in ('gallery','blog','listings'));
