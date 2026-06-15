-- Run this in the Supabase SQL Editor to create all tables.
-- Supabase Auth handles the auth.users table automatically.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  body_photo_url text,
  created_at timestamptz default now()
);

create table if not exists public.style_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique not null references auth.users(id) on delete cascade,
  aesthetics text,
  preferred_colors text,
  budget_range text,
  occasions text,
  body_type text,
  gender text,
  raw_answers text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.clothing_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  image_url text not null,
  category text not null,
  color text,
  description text,
  tags text,
  created_at timestamptz default now()
);

create table if not exists public.outfits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text,
  description text,
  image_url text,
  score real,
  created_at timestamptz default now()
);

create table if not exists public.outfit_items (
  id uuid primary key default gen_random_uuid(),
  outfit_id uuid not null references public.outfits(id) on delete cascade,
  clothing_item_id uuid not null references public.clothing_items(id) on delete cascade
);

create table if not exists public.swipe_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  outfit_id uuid not null references public.outfits(id) on delete cascade,
  direction text not null,
  created_at timestamptz default now()
);

-- Auto-create a profile row when a new user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Enable Row Level Security
alter table public.profiles enable row level security;
alter table public.style_profiles enable row level security;
alter table public.clothing_items enable row level security;
alter table public.outfits enable row level security;
alter table public.outfit_items enable row level security;
alter table public.swipe_history enable row level security;

-- RLS Policies: users can only access their own data
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

create policy "Users can manage own style" on public.style_profiles for all using (auth.uid() = user_id);

create policy "Users can manage own clothing" on public.clothing_items for all using (auth.uid() = user_id);

create policy "Users can manage own outfits" on public.outfits for all using (auth.uid() = user_id);

create policy "Users can view own outfit items" on public.outfit_items for select using (
  outfit_id in (select id from public.outfits where user_id = auth.uid())
);
create policy "Users can insert own outfit items" on public.outfit_items for insert with check (
  outfit_id in (select id from public.outfits where user_id = auth.uid())
);
create policy "Users can delete own outfit items" on public.outfit_items for delete using (
  outfit_id in (select id from public.outfits where user_id = auth.uid())
);

create policy "Users can manage own swipes" on public.swipe_history for all using (auth.uid() = user_id);

-- Storage bucket for clothing images
insert into storage.buckets (id, name, public)
values ('clothing', 'clothing', true)
on conflict (id) do nothing;

create policy "Authenticated users can upload" on storage.objects
for insert to authenticated with check (bucket_id = 'clothing');

create policy "Anyone can view clothing images" on storage.objects
for select using (bucket_id = 'clothing');
