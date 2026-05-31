-- Shiori Supabase Schema
-- Run in your Supabase SQL Editor (Dashboard → SQL Editor → New Query)

create extension if not exists "uuid-ossp";

-- Courses
create table if not exists courses (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  code text,
  color text default '#afc6ff',
  instructor text,
  credits numeric(3,1) default 3,
  created_at timestamptz default now()
);
alter table courses enable row level security;
create policy "Users own courses" on courses for all using (auth.uid() = user_id);

-- Assignments
create table if not exists assignments (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  course_id text references courses(id) on delete set null,
  course_name text,
  title text not null,
  description text,
  due_date text,
  status text default 'pending' check (status in ('pending', 'in_progress', 'completed', 'graded')),
  priority text default 'medium' check (priority in ('low', 'medium', 'high')),
  estimated_hours numeric(4,1),
  grade numeric(5,2),
  created_at timestamptz default now()
);
alter table assignments enable row level security;
create policy "Users own assignments" on assignments for all using (auth.uid() = user_id);

-- Notes
create table if not exists notes (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  course_id text references courses(id) on delete set null,
  title text not null default '',
  content text default '',
  tags text[] default '{}',
  pinned boolean default false,
  color text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table notes enable row level security;
create policy "Users own notes" on notes for all using (auth.uid() = user_id);

-- Flashcard Decks
create table if not exists flashcard_decks (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  course_id text references courses(id) on delete set null,
  name text not null,
  description text,
  color text default '#afc6ff',
  created_at timestamptz default now()
);
alter table flashcard_decks enable row level security;
create policy "Users own decks" on flashcard_decks for all using (auth.uid() = user_id);

create table if not exists flashcards (
  id text primary key,
  deck_id text references flashcard_decks(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  front text not null,
  back text not null,
  streak integer default 0,
  next_review timestamptz,
  created_at timestamptz default now()
);
alter table flashcards enable row level security;
create policy "Users own flashcards" on flashcards for all using (auth.uid() = user_id);

-- Events
create table if not exists events (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  course_id text references courses(id) on delete set null,
  title text not null,
  type text default 'event' check (type in ('event', 'exam', 'assignment', 'reminder', 'class')),
  start_at text,
  end_at text,
  description text,
  color text,
  created_at timestamptz default now()
);
alter table events enable row level security;
create policy "Users own events" on events for all using (auth.uid() = user_id);

-- Habits
create table if not exists habits (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  description text,
  frequency text default 'daily' check (frequency in ('daily', 'weekly')),
  target_days integer default 7,
  color text default '#4dff91',
  icon text default '✓',
  streak integer default 0,
  completions text[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table habits enable row level security;
create policy "Users own habits" on habits for all using (auth.uid() = user_id);

-- Study Plans
create table if not exists study_plans (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  course_id text references courses(id) on delete set null,
  content text,
  generated_at text,
  status text default 'active' check (status in ('active', 'completed', 'archived')),
  created_at timestamptz default now()
);
alter table study_plans enable row level security;
create policy "Users own study plans" on study_plans for all using (auth.uid() = user_id);

-- Pro Subscriptions
create table if not exists subscriptions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  stripe_customer_id text,
  stripe_subscription_id text,
  status text default 'inactive' check (status in ('active', 'inactive', 'cancelled', 'past_due')),
  plan text default 'free' check (plan in ('free', 'pro', 'pro_annual')),
  current_period_end timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table subscriptions enable row level security;
create policy "Users read own subscription" on subscriptions for select using (auth.uid() = user_id);
