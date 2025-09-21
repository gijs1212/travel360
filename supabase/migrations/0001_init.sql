create extension if not exists "pgcrypto";

-- Create profiles table
create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  username text unique not null,
  email text unique not null,
  role text not null default 'commenter' check (role in ('uploader', 'commenter')),
  display_name text,
  avatar_url text,
  created_at timestamptz not null default timezone('utc'::text, now())
);

alter table public.profiles enable row level security;

-- Insert/update via trigger based on auth.users metadata
create or replace function public.handle_new_user() returns trigger as $$
begin
  insert into public.profiles (id, email, username, role, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'commenter'),
    new.raw_user_meta_data->>'display_name',
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do update set
    email = excluded.email,
    username = excluded.username,
    role = excluded.role,
    display_name = excluded.display_name,
    avatar_url = excluded.avatar_url;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Profiles policies
create policy "Profiles are public" on public.profiles
  for select using (true);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- Trips table
create table if not exists public.trips (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  start_date date,
  end_date date,
  created_by uuid not null references public.profiles (id),
  polarsteps_url text,
  polarsteps_embed_url text,
  created_at timestamptz not null default timezone('utc'::text, now())
);

alter table public.trips enable row level security;

create policy "Trips are public" on public.trips
  for select using (true);

create policy "Uploader manages trips" on public.trips
  for all using (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid() and p.role = 'uploader'
    )
  ) with check (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid() and p.role = 'uploader'
    )
  );

-- Photos table
create table if not exists public.photos (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid references public.trips (id) on delete cascade,
  storage_path text not null,
  thumb_path text,
  title text not null,
  day text not null,
  description text,
  is360 boolean not null default false,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default timezone('utc'::text, now())
);

alter table public.photos enable row level security;

create policy "Photos are public" on public.photos
  for select using (true);

create policy "Uploader manages photos" on public.photos
  for all using (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid() and p.role = 'uploader'
    )
  ) with check (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid() and p.role = 'uploader'
    )
  );

-- Comments table
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  photo_id uuid references public.photos (id) on delete cascade,
  author_id uuid references public.profiles (id),
  content text not null,
  created_at timestamptz not null default timezone('utc'::text, now())
);

alter table public.comments enable row level security;

create policy "Comments are public" on public.comments
  for select using (true);

create policy "Logged in users can comment" on public.comments
  for insert with check (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid() and p.role in ('uploader', 'commenter')
    )
  );

create policy "Authors manage own comments" on public.comments
  for update using (auth.uid() = author_id) with check (auth.uid() = author_id);

create policy "Authors delete own comments" on public.comments
  for delete using (auth.uid() = author_id);

-- Ensure author_id defaults to auth user
create or replace function public.handle_comment_author() returns trigger as $$
begin
  if new.author_id is null then
    new.author_id := auth.uid();
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists comments_set_author on public.comments;
create trigger comments_set_author
  before insert on public.comments
  for each row execute procedure public.handle_comment_author();
