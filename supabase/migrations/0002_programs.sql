-- ============================================================
-- Game of Meditation — Programs & Enrollments Schema
-- ============================================================

-- ─── Programs ─────────────────────────────────────────────────
-- Structured meditation challenges (e.g. 21-day programs)

create table public.programs (
  id              uuid primary key default gen_random_uuid(),
  title           text not null,
  description     text,
  tradition       text not null default 'open',   -- maps to SESSION_TYPES key
  duration_days   integer not null default 21 check (duration_days between 1 and 365),
  daily_minutes   integer not null default 10 check (daily_minutes between 1 and 120),
  difficulty      text not null default 'beginner' check (difficulty in ('beginner','intermediate','advanced')),
  language_code   text not null default 'en',
  cover_emoji     text not null default '🧘',
  is_published    boolean not null default false,
  created_by      uuid references public.profiles(id) on delete set null,
  created_at      timestamptz not null default now()
);

create index programs_language_idx on public.programs(language_code);
create index programs_published_idx on public.programs(is_published) where is_published = true;

-- ─── Program Enrollments ──────────────────────────────────────
-- Tracks which user is enrolled in which program

create table public.program_enrollments (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles(id) on delete cascade,
  program_id   uuid not null references public.programs(id) on delete cascade,
  enrolled_at  timestamptz not null default now(),
  completed_at timestamptz,
  unique (user_id, program_id)
);

create index enrollments_user_id_idx on public.program_enrollments(user_id);

-- ─── Program Day Completions ──────────────────────────────────
-- One row per day completed within a program enrollment

create table public.program_day_completions (
  id            uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null references public.program_enrollments(id) on delete cascade,
  day_number    integer not null check (day_number >= 1),
  session_id    uuid references public.sessions(id) on delete set null,
  completed_at  timestamptz not null default now(),
  unique (enrollment_id, day_number)
);

create index day_completions_enrollment_idx on public.program_day_completions(enrollment_id);

-- ─── Row Level Security ───────────────────────────────────────

alter table public.programs enable row level security;
alter table public.program_enrollments enable row level security;
alter table public.program_day_completions enable row level security;

-- Programs: all published programs are publicly readable
create policy "Published programs are readable by all"
  on public.programs for select using (is_published = true);

create policy "Authenticated teachers can create programs"
  on public.programs for insert with check (auth.uid() = created_by);

-- Enrollments: users manage their own
create policy "Users can read their own enrollments"
  on public.program_enrollments for select using (auth.uid() = user_id);

create policy "Users can enroll themselves"
  on public.program_enrollments for insert with check (auth.uid() = user_id);

create policy "Users can update their own enrollments"
  on public.program_enrollments for update using (auth.uid() = user_id);

-- Day completions: scoped to enrollment owner
create policy "Users can read their own day completions"
  on public.program_day_completions for select using (
    exists (
      select 1 from public.program_enrollments e
      where e.id = program_day_completions.enrollment_id and e.user_id = auth.uid()
    )
  );

create policy "Users can insert their own day completions"
  on public.program_day_completions for insert with check (
    exists (
      select 1 from public.program_enrollments e
      where e.id = program_day_completions.enrollment_id and e.user_id = auth.uid()
    )
  );

-- ─── Seed: 3 MVP Programs ─────────────────────────────────────
-- These are hardcoded for MVP; teacher-uploaded content is Phase 2

insert into public.programs (title, description, tradition, duration_days, daily_minutes, difficulty, language_code, cover_emoji, is_published) values
(
  '21 Days of Presence',
  'A foundational program to establish a daily meditation habit. Each day you sit for 10 minutes in open awareness — observing thoughts without attachment. Simple, powerful, life-changing.',
  'open',
  21,
  10,
  'beginner',
  'en',
  '🌿',
  true
),
(
  'Breath & Focus Challenge',
  'Strengthen your concentration with daily breathwork sessions. Over 21 days you will develop the ability to direct and sustain attention — a core skill that benefits every area of life.',
  'breathwork',
  21,
  15,
  'intermediate',
  'en',
  '🌬️',
  true
),
(
  'Loving-Kindness Journey',
  'Transform your relationship with yourself and others through 21 days of Metta meditation. Begin with self-compassion and gradually extend warmth to family, community, and all beings.',
  'metta',
  21,
  10,
  'beginner',
  'en',
  '💚',
  true
);
