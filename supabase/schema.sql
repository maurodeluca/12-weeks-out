-- 12 Weeks Out — cloud sync + leaderboard schema
-- Run this once in the Supabase SQL Editor (Project → SQL Editor → New query → paste → Run).
-- Safe to re-run: uses "if not exists" / "or replace" throughout.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default '',
  category text not null default 'men' check (category in ('men', 'women')),
  updated_at timestamptz not null default now()
);

create table if not exists public.progress (
  user_id uuid not null references auth.users (id) on delete cascade,
  week int not null check (week between 1 and 12),
  exercise_id text not null,
  amount numeric not null default 0 check (amount >= 0),
  updated_at timestamptz not null default now(),
  primary key (user_id, week, exercise_id)
);

create table if not exists public.notes (
  user_id uuid not null references auth.users (id) on delete cascade,
  week int not null check (week between 1 and 12),
  text text not null default '',
  updated_at timestamptz not null default now(),
  primary key (user_id, week)
);

-- Singleton row (id = 1) holding Week 12's details, revealed by the coach as the instructor announces them.
create table if not exists public.week12_details (
  id int primary key default 1 check (id = 1),
  location text not null default '',
  weight text not null default '',
  distance text not null default '',
  gradient text not null default '',
  updated_at timestamptz not null default now()
);
insert into public.week12_details (id) values (1) on conflict (id) do nothing;

alter table public.profiles enable row level security;
alter table public.progress enable row level security;
alter table public.notes enable row level security;
alter table public.week12_details enable row level security;

-- RLS policies only ever *restrict* rows for a role that can already query the table at all -
-- they don't grant base table access by themselves. Without these grants, Postgres rejects every
-- query with "permission denied for table ..." before RLS even gets a chance to run.
grant select, insert, update on public.profiles to authenticated;
grant select, insert, update, delete on public.progress to authenticated;
grant select, insert, update, delete on public.notes to authenticated;
grant select on public.week12_details to anon, authenticated;
grant insert, update on public.week12_details to authenticated;

-- Coach/admin emails allowed to edit Week 12 details. Add more as a comma-separated array entry.
-- Keep this in sync with COACH_EMAILS in src/lib/coach.ts (that's only a client-side UI gate;
-- this is what actually enforces it).

-- Everyone signed in can read names/categories (needed to render the leaderboard),
-- but can only write their own row.
drop policy if exists "profiles are readable by signed-in users" on public.profiles;
create policy "profiles are readable by signed-in users"
  on public.profiles for select
  to authenticated
  using (true);

drop policy if exists "users manage their own profile" on public.profiles;
create policy "users manage their own profile"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

drop policy if exists "users update their own profile" on public.profiles;
create policy "users update their own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Progress is readable by everyone signed in (that's what powers the leaderboard),
-- but each person can only write their own rows.
drop policy if exists "progress is readable by signed-in users" on public.progress;
create policy "progress is readable by signed-in users"
  on public.progress for select
  to authenticated
  using (true);

drop policy if exists "users manage their own progress" on public.progress;
create policy "users manage their own progress"
  on public.progress for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Notes are private: only the author can read or write them.
drop policy if exists "users manage their own notes" on public.notes;
create policy "users manage their own notes"
  on public.notes for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Week 12 details are public (no sign-in needed, matches the app working fully offline/local),
-- but only the coach email(s) can write them.
drop policy if exists "week12 details are publicly readable" on public.week12_details;
create policy "week12 details are publicly readable"
  on public.week12_details for select
  to anon, authenticated
  using (true);

drop policy if exists "only coaches can edit week12 details" on public.week12_details;
create policy "only coaches can edit week12 details"
  on public.week12_details for all
  to authenticated
  using ((auth.jwt() ->> 'email') = any (array['maurodeluca@live.ie']))
  with check ((auth.jwt() ->> 'email') = any (array['maurodeluca@live.ie']));
