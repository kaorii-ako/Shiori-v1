-- ============================================================================
-- Shiori — Supabase schema
-- ============================================================================
-- Run in your Supabase project: Dashboard → SQL Editor → New query → Run.
-- Safe to re-run. If you ran an OLDER version of this file, the "fix-ups"
-- block below repairs the column types that changed.
--
-- Design notes:
--  * Primary keys are TEXT — the app uses friendly ids like 'course-123',
--    'note-456', and 'gc-<courseId>-<workId>' for Google Classroom items.
--  * user_id references auth.users(id) (uuid) and cascades on delete.
--  * grade and completions are JSONB (the app stores objects there).
--  * Row Level Security ensures each user only ever sees their own rows.
-- ============================================================================

create extension if not exists "uuid-ossp";

-- ── Courses ────────────────────────────────────────────────────────────────
create table if not exists public.courses (
  id          text primary key,
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null,
  code        text,
  color       text default '#afc6ff',
  instructor  text,
  credits     numeric(3,1) default 3,
  source      text,
  created_at  timestamptz default now()
);

-- ── Assignments ────────────────────────────────────────────────────────────
create table if not exists public.assignments (
  id              text primary key,
  user_id         uuid not null references auth.users(id) on delete cascade,
  course_id       text,
  course_name     text,
  title           text not null,
  description     text,
  due_date        text,
  status          text default 'pending',
  priority        text default 'medium',
  estimated_hours numeric(4,1),
  grade           jsonb,
  source          text,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- ── Notes ──────────────────────────────────────────────────────────────────
create table if not exists public.notes (
  id          text primary key,
  user_id     uuid not null references auth.users(id) on delete cascade,
  course_id   text,
  title       text default '',
  content     text default '',
  tags        jsonb default '[]'::jsonb,
  pinned      boolean default false,
  color       text,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- ── Flashcard decks ────────────────────────────────────────────────────────
create table if not exists public.flashcard_decks (
  id          text primary key,
  user_id     uuid not null references auth.users(id) on delete cascade,
  course_id   text,
  name        text not null,
  description text,
  color       text default '#afc6ff',
  created_at  timestamptz default now()
);

-- ── Flashcards ─────────────────────────────────────────────────────────────
create table if not exists public.flashcards (
  id          text primary key,
  deck_id     text not null references public.flashcard_decks(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  front       text,
  back        text,
  streak      integer default 0,
  next_review text,
  created_at  timestamptz default now()
);

-- ── Events ─────────────────────────────────────────────────────────────────
create table if not exists public.events (
  id          text primary key,
  user_id     uuid not null references auth.users(id) on delete cascade,
  course_id   text,
  title       text not null,
  type        text default 'event',
  start_at    text,
  end_at      text,
  description text,
  color       text,
  created_at  timestamptz default now()
);

-- ── Habits ─────────────────────────────────────────────────────────────────
create table if not exists public.habits (
  id          text primary key,
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null,
  color       text default '#4dff91',
  streak      integer default 0,
  completions jsonb default '{}'::jsonb,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- ── Study plans ────────────────────────────────────────────────────────────
create table if not exists public.study_plans (
  id           text primary key,
  user_id      uuid not null references auth.users(id) on delete cascade,
  title        text,
  course_id    text,
  content      text,
  generated_at text,
  status       text default 'active',
  created_at   timestamptz default now()
);

-- ── New columns for installs created before 'source' / 'updated_at' existed ─
alter table public.courses     add column if not exists source     text;
alter table public.assignments add column if not exists source     text;
alter table public.assignments add column if not exists updated_at timestamptz default now();

-- ── Fix-ups for installs that ran an older version of this file ─────────────
-- (changes grade & completions to jsonb, drops over-strict CHECK constraints)
do $$
begin
  begin alter table public.assignments drop constraint if exists assignments_status_check; exception when others then null; end;
  begin alter table public.assignments drop constraint if exists assignments_priority_check; exception when others then null; end;
  begin alter table public.events drop constraint if exists events_type_check; exception when others then null; end;

  begin alter table public.assignments alter column grade drop default; exception when others then null; end;
  begin alter table public.assignments alter column grade type jsonb using to_jsonb(grade); exception when others then null; end;

  begin alter table public.habits alter column completions drop default; exception when others then null; end;
  begin alter table public.habits alter column completions type jsonb using to_jsonb(completions); exception when others then null; end;
  begin alter table public.habits alter column completions set default '{}'::jsonb; exception when others then null; end;

  begin alter table public.notes alter column tags drop default; exception when others then null; end;
  begin alter table public.notes alter column tags type jsonb using to_jsonb(tags); exception when others then null; end;
  begin alter table public.notes alter column tags set default '[]'::jsonb; exception when others then null; end;
end $$;

-- ── Indexes (per-user lookups + due-date ordering) ─────────────────────────
create index if not exists idx_courses_user        on public.courses(user_id);
create index if not exists idx_assignments_user     on public.assignments(user_id);
create index if not exists idx_notes_user           on public.notes(user_id);
create index if not exists idx_flashcard_decks_user on public.flashcard_decks(user_id);
create index if not exists idx_flashcards_user      on public.flashcards(user_id);
create index if not exists idx_events_user          on public.events(user_id);
create index if not exists idx_habits_user          on public.habits(user_id);
create index if not exists idx_study_plans_user     on public.study_plans(user_id);

-- ============================================================================
-- Row Level Security — reset policies so each user can only touch their rows.
-- ============================================================================
do $$
declare
  t text;
  r record;
begin
  foreach t in array array[
    'courses','assignments','notes','flashcard_decks',
    'flashcards','events','habits','study_plans'
  ]
  loop
    execute format('alter table public.%I enable row level security;', t);
    for r in (select policyname from pg_policies where schemaname = 'public' and tablename = t)
    loop
      execute format('drop policy if exists %I on public.%I;', r.policyname, t);
    end loop;
    execute format(
      'create policy "own rows" on public.%I
         for all
         using (auth.uid() = user_id)
         with check (auth.uid() = user_id);', t);
  end loop;
end $$;
