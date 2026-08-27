-- Seldovia.com archive migration — schema prep
-- Run this ONCE in the Supabase SQL editor BEFORE loading the 2,787 archive rows.
-- Safe to re-run (all statements are idempotent).

-- 1) Traceability + safe rollback marker.
alter table public.posts add column if not exists source text;   -- 'seldovia_archive' for imported rows
alter table public.posts add column if not exists wp_id  bigint; -- original WordPress post ID
alter table public.posts add column if not exists slug   text;   -- original WordPress slug (for redirects later)

-- 2) Don't import the same WordPress post twice on a re-run.
create unique index if not exists posts_wp_id_key on public.posts (wp_id) where wp_id is not null;

-- 3) Full-text search over title + body (for making the archive searchable).
create index if not exists posts_fts_idx
  on public.posts
  using gin (to_tsvector('english', coalesce(title,'') || ' ' || coalesce(body,'')));

-- ---------------------------------------------------------------------------
-- ROLLBACK (if the import goes wrong): removes ONLY imported rows, leaves the
-- hand-written posts untouched:
--   delete from public.posts where source = 'seldovia_archive';
-- ---------------------------------------------------------------------------
