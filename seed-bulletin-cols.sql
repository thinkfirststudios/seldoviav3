-- Bulletin board: add a photo and a calendar-event link to notices.
-- Run once in Supabase → SQL Editor. Safe to re-run (IF NOT EXISTS).
-- Bulletin photos reuse the existing public "blog" storage bucket, so no new bucket is needed.

alter table public.bulletin add column if not exists image_url text;
alter table public.bulletin add column if not exists event_url text;
