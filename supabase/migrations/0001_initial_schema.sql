-- ============================================================
-- Game of Meditation — Initial Schema
-- ============================================================

-- Enable UUID generation
create extension if not exists "pgcrypto";

-- ─── Enums ───────────────────────────────────────────────────

create type public.buddha_level as enum (
  'seed',
  'sprout',
  'sapling',
  'tree',
  'elder_tree',
  'forest',
  'mountain',
  'sky',
  'infinite'
);

create type public.session_status as enum (
  'completed',
  'abandoned',
  'in_progress'
);

create type public.club_role as enum (
  'member',
  'moderator',
  'admin'
);

-- ─── Profiles ────────────────────────────────────────────────

create table public.profiles (
  id                    uuid primary key references auth.users(id) on delete cascade,
  username              text unique not null,
  display_name          text,
  avatar_url            text,
  bio                   text,
  language_code         text not null default 'en',
  country_code          text,
  buddha_level          public.buddha_level not null default 'seed',
  mind_stability_score  integer not null default 0 check (mind_stability_score between 0 and 1000),
  total_minutes         integer not null default 0 check (total_minutes >= 0),
  current_streak_days   integer not null default 0 check (current_streak_days >= 0),
  longest_streak_days   integer not null default 0 check (longest_streak_days >= 0),
  is_anonymous          boolean not null default false,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

-- Auto-update updated_at
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, username, language_code)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', 'player_' || substr(new.id::text, 1, 8)),
    coalesce(new.raw_user_meta_data->>'language_code', 'en')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─── Meditation Sessions ──────────────────────────────────────

create table public.sessions (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references public.profiles(id) on delete cascade,
  duration_seconds  integer not null check (duration_seconds >= 10),  -- min 10 seconds
  status            public.session_status not null default 'in_progress',
  theme             text,
  mss_delta         integer not null default 0,
  notes             text,
  biometric_data    jsonb,
  created_at        timestamptz not null default now()
);

create index sessions_user_id_idx on public.sessions(user_id);
create index sessions_created_at_idx on public.sessions(created_at desc);

-- ─── Clubs ───────────────────────────────────────────────────

create table public.clubs (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  description   text,
  avatar_url    text,
  language_code text not null default 'en',
  country_code  text,
  is_public     boolean not null default true,
  member_count  integer not null default 0 check (member_count >= 0),
  total_minutes integer not null default 0 check (total_minutes >= 0),
  created_by    uuid not null references public.profiles(id) on delete restrict,
  created_at    timestamptz not null default now()
);

create table public.club_members (
  club_id   uuid not null references public.clubs(id) on delete cascade,
  user_id   uuid not null references public.profiles(id) on delete cascade,
  role      public.club_role not null default 'member',
  joined_at timestamptz not null default now(),
  primary key (club_id, user_id)
);

create index club_members_user_id_idx on public.club_members(user_id);

-- ─── Row Level Security ───────────────────────────────────────

alter table public.profiles enable row level security;
alter table public.sessions enable row level security;
alter table public.clubs enable row level security;
alter table public.club_members enable row level security;

-- Profiles: anyone can read public profiles; only owner can update
create policy "Profiles are publicly readable"
  on public.profiles for select using (true);

create policy "Users can update their own profile"
  on public.profiles for update using (auth.uid() = id);

-- Sessions: private — only owner can read/write
create policy "Users can read their own sessions"
  on public.sessions for select using (auth.uid() = user_id);

create policy "Users can insert their own sessions"
  on public.sessions for insert with check (auth.uid() = user_id);

create policy "Users can update their own sessions"
  on public.sessions for update using (auth.uid() = user_id);

-- Clubs: public clubs are readable by all; private clubs only by members
create policy "Public clubs are readable by all"
  on public.clubs for select using (
    is_public = true or
    exists (
      select 1 from public.club_members
      where club_id = clubs.id and user_id = auth.uid()
    )
  );

create policy "Authenticated users can create clubs"
  on public.clubs for insert with check (auth.uid() = created_by);

-- Club members: readable by members of that club
create policy "Club members can view membership"
  on public.club_members for select using (
    exists (
      select 1 from public.club_members cm
      where cm.club_id = club_members.club_id and cm.user_id = auth.uid()
    )
  );

create policy "Users can join clubs"
  on public.club_members for insert with check (auth.uid() = user_id);

create policy "Users can leave clubs"
  on public.club_members for delete using (auth.uid() = user_id);
