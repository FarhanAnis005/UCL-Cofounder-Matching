-- =========================================================
-- UCL COHORT NETWORK - SUPABASE DATABASE SCHEMA
-- =========================================================
-- Run this script in your Supabase project's SQL Editor:
-- Dashboard -> Project -> SQL Editor -> New Query -> Paste & Run

-- 1. Create the `profiles` table (Strict UCL Cohort Access)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  full_name text not null default '',
  avatar_url text,
  phone text not null,
  bio text not null default '', -- The One-Liner (Max 100 chars)
  current_focus text not null default 'Building a Startup',
  superpowers text[] not null default '{}',
  looking_for text[] not null default '{}',
  industries text[] not null default '{}',
  ucl_department text default 'Computer Science',
  graduation_year text default '2025',
  linkedin_url text,
  github_url text,
  website_url text,
  pitch_deck_url text,
  custom_fields jsonb not null default '{}'::jsonb, -- Arbitrary custom key-value pairs
  custom_tags text[] not null default '{}',
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

-- Safe migrations in case the table was created previously:
alter table public.profiles add column if not exists email text unique;
alter table public.profiles add column if not exists website_url text;
alter table public.profiles add column if not exists pitch_deck_url text;
alter table public.profiles add column if not exists custom_fields jsonb not null default '{}'::jsonb;
alter table public.profiles add column if not exists custom_tags text[] not null default '{}';

-- 2. Enforce strict UCL email constraint at the Postgres database level
alter table public.profiles drop constraint if exists check_ucl_email;
alter table public.profiles add constraint check_ucl_email
  check (email is null or email ilike '%ucl.ac.uk' or email ilike '%uclmail.net');

-- 3. Performance indexes (especially GIN for Postgres text arrays & JSONB)
create index if not exists idx_profiles_email on public.profiles (email);
create index if not exists idx_profiles_current_focus on public.profiles (current_focus);
create index if not exists idx_profiles_superpowers on public.profiles using gin (superpowers);
create index if not exists idx_profiles_looking_for on public.profiles using gin (looking_for);
create index if not exists idx_profiles_industries on public.profiles using gin (industries);
create index if not exists idx_profiles_custom_fields on public.profiles using gin (custom_fields);

-- 4. Automatic timestamp updater trigger
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_updated_at on public.profiles;
create trigger set_updated_at
  before update on public.profiles
  for each row
  execute function public.handle_updated_at();

-- 5. Enable Row Level Security (RLS)
alter table public.profiles enable row level security;

-- Policy 1: Authenticated users can view all cohort profiles
create policy "Authenticated users can view all profiles"
  on public.profiles
  for select
  to authenticated
  using (true);

-- Policy 2: Users can insert their own profile
create policy "Users can insert their own profile"
  on public.profiles
  for insert
  to authenticated
  with check (auth.uid() = id);

-- Policy 3: Users can only update their own profile
create policy "Users can update their own profile"
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Policy 4: Allow anonymous/guest read access for open directory viewing
create policy "Public can read profiles"
  on public.profiles
  for select
  to anon
  using (true);

-- =========================================================
-- 6. SUPABASE STORAGE BUCKET: AVATARS
-- =========================================================
-- Creates the public 'avatars' bucket for user photos and headshots
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars',
  'avatars',
  true,
  5242880, -- 5 MB limit
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- Storage Policy 1: Anyone can view avatar photos
drop policy if exists "Avatar photos are publicly accessible" on storage.objects;
create policy "Avatar photos are publicly accessible"
  on storage.objects for select
  using (bucket_id = 'avatars');

-- Storage Policy 2: Authenticated cohort members can upload photos
drop policy if exists "Authenticated users can upload avatars" on storage.objects;
create policy "Authenticated users can upload avatars"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'avatars');

-- Storage Policy 3: Users can update or delete their own photos
drop policy if exists "Users can update their own avatar" on storage.objects;
create policy "Users can update their own avatar"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'avatars');

drop policy if exists "Users can delete their own avatar" on storage.objects;
create policy "Users can delete their own avatar"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'avatars');

