-- Contact-form inbox. Run ONCE in Supabase → SQL Editor (safe to re-run).
create table if not exists public.messages (
  id         uuid primary key default gen_random_uuid(),
  name       text,
  email      text,
  topic      text,
  message    text,
  created_at timestamptz not null default now()
);

alter table public.messages enable row level security;

-- Anyone can SUBMIT the public contact form (insert only)...
drop policy if exists "public insert messages" on public.messages;
create policy "public insert messages" on public.messages for insert
  to anon, authenticated with check (true);

-- ...but only a signed-in user (Jenny) can READ or DELETE them.
drop policy if exists "auth read messages" on public.messages;
create policy "auth read messages" on public.messages for select
  to authenticated using (true);

drop policy if exists "auth delete messages" on public.messages;
create policy "auth delete messages" on public.messages for delete
  to authenticated using (true);
