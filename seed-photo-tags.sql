-- Photo Journal: add a searchable "tags" field (Jenny #9).
-- Run once in the Supabase SQL editor. Safe to re-run.
-- Until this is run, the admin still posts photos (it just skips tags);
-- the photo search already works on month, year, and caption.
alter table public.photos add column if not exists tags text;
