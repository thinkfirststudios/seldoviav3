-- Site settings (key/value) — powers the home "of the day" widget picker in the admin.
-- Run once in Supabase → SQL Editor. Safe to re-run.

create table if not exists public.settings (
  key        text primary key,
  value      text,
  updated_at timestamptz default now()
);

alter table public.settings enable row level security;

-- Public can READ settings (the site reads which widget to show)...
drop policy if exists "settings public read" on public.settings;
create policy "settings public read" on public.settings for select using (true);

-- ...only signed-in admins can WRITE.
drop policy if exists "settings admin write" on public.settings;
create policy "settings admin write" on public.settings for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- Default: show the Alaska fact of the day.
insert into public.settings (key, value) values ('home_extra', 'alaska_fact')
  on conflict (key) do nothing;
