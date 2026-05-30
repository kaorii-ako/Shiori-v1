-- Shiori Supabase Schema
-- Run this in your Supabase SQL editor: https://supabase.com/dashboard

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles (extends Supabase auth.users)
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  name text,
  email text,
  avatar_url text,
  country text,
  streak int default 0,
  xp int default 0,
  is_pro boolean default false,
  pro_expires_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Courses
create table if not exists public.courses (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  code text,
  color text default '#afc6ff',
  instructor text,
  credits int default 3,
  created_at timestamptz default now()
);

-- Assignments
create table if not exists public.assignments (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  course_id text references public.courses(id) on delete cascade,
  course_name text,
  title text not null,
  description text,
  due_date timestamptz,
  status text default 'pending',
  priority text default 'medium',
  estimated_hours numeric(4,1),
  grade numeric(5,2),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Grades
create table if not exists public.grades (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  course_id text references public.courses(id) on delete cascade not null,
  assignment_id text,
  title text not null,
  points_earned numeric(7,2) not null,
  points_possible numeric(7,2) not null,
  category_id text,
  graded_at timestamptz default now()
);

-- Course grade weight categories
create table if not exists public.grade_categories (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  course_id text references public.courses(id) on delete cascade not null,
  name text not null,
  weight numeric(5,2) not null
);

-- Notes
create table if not exists public.notes (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  course_id text references public.courses(id) on delete set null,
  title text,
  content text,
  tags text[],
  pinned boolean default false,
  color text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Flashcard decks
create table if not exists public.flashcard_decks (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  course_id text references public.courses(id) on delete set null,
  name text not null,
  description text,
  color text default '#afc6ff',
  created_at timestamptz default now()
);

-- Flashcards
create table if not exists public.flashcards (
  id text primary key,
  deck_id text references public.flashcard_decks(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  front text not null,
  back text not null,
  streak int default 0,
  next_review timestamptz,
  last_reviewed timestamptz
);

-- Calendar events
create table if not exists public.events (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  course_id text references public.courses(id) on delete set null,
  title text not null,
  type text default 'event',
  start_at timestamptz,
  end_at timestamptz,
  description text,
  color text,
  created_at timestamptz default now()
);

-- Study plans
create table if not exists public.study_plans (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  content text,
  course_id text,
  estimated_hours numeric(4,1),
  completed boolean default false,
  order_index int default 0,
  created_at timestamptz default now()
);

-- ============================================================
-- Row Level Security (RLS) — users only see their own data
-- ============================================================

alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.assignments enable row level security;
alter table public.grades enable row level security;
alter table public.grade_categories enable row level security;
alter table public.notes enable row level security;
alter table public.flashcard_decks enable row level security;
alter table public.flashcards enable row level security;
alter table public.events enable row level security;
alter table public.study_plans enable row level security;

-- Profiles
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);

-- Generic "own data" policies
create policy "Own courses" on public.courses for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Own assignments" on public.assignments for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Own grades" on public.grades for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Own grade_categories" on public.grade_categories for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Own notes" on public.notes for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Own flashcard_decks" on public.flashcard_decks for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Own flashcards" on public.flashcards for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Own events" on public.events for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Own study_plans" on public.study_plans for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================================================
-- Trigger: auto-create profile on new user signup
-- ============================================================

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, name, email, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
