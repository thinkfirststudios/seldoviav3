-- One "Seldovia Blog" submission form (Jenny): the blog post form now has a
-- Web link field. Add the column once in Supabase -> SQL Editor.
alter table public.posts add column if not exists link text;
