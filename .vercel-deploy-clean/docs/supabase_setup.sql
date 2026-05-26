create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  gender text check (gender in ('male', 'female')),
  age integer,
  height_cm numeric(5,1),
  weight_kg numeric(5,1),
  activity_level text check (activity_level in ('sedentary', 'light', 'moderate', 'active', 'very_active')),
  goal_type text check (goal_type in ('lose', 'maintain', 'gain')),
  daily_calorie_goal integer default 2000,
  protein_goal integer default 150,
  carb_goal integer default 250,
  fat_goal integer default 65,
  gemini_model text default 'flash' check (gemini_model in ('flash', 'pro')),
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Users can manage own profile" on public.profiles;
create policy "Users can manage own profile"
  on public.profiles
  for all
  using (auth.uid() = id)
  with check (auth.uid() = id);

create table if not exists public.meal_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  meal_type text check (meal_type in ('breakfast', 'lunch', 'dinner', 'snack')),
  food_name text not null,
  calories integer not null,
  protein numeric(5,1),
  carbs numeric(5,1),
  fat numeric(5,1),
  quantity text,
  image_url text,
  notes text,
  logged_at timestamptz default now(),
  created_at timestamptz default now()
);

create index if not exists meal_logs_user_id_logged_at_idx
  on public.meal_logs (user_id, logged_at desc);

alter table public.meal_logs enable row level security;

drop policy if exists "Users can manage own meal logs" on public.meal_logs;
create policy "Users can manage own meal logs"
  on public.meal_logs
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
