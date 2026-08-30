-- Publish APPROVED phone-book submissions to the public directory (Jenny #29).
-- Run once in the Supabase SQL editor. Safe to re-run.
-- The public can read ONLY rows Jenny has approved; pending/rejected stay private.
-- (Anonymous submit + authenticated admin management already exist in seed-public-forms.sql.)
drop policy if exists "public can read approved directory" on public.directory_submissions;
create policy "public can read approved directory" on public.directory_submissions
  for select to anon using (status = 'approved');
