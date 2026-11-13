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

alter table public.profiles enable row level security;
alter table public.progress enable row level security;
alter table public.notes enable row level security;

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
