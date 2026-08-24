-- Конструктор сайтов: начальная схема БД (Supabase / PostgreSQL).
-- Выполните этот файл в SQL Editor Supabase (или через `supabase db push`).

-- ============================================================
-- Профили пользователей
-- ============================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  plan_tier text not null default 'free',
  created_at timestamptz not null default now()
);

-- Автосоздание профиля при регистрации
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- Проекты и страницы
-- ============================================================
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  name text not null default 'Мой проект',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.pages (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects (id) on delete set null,
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null default 'Новая страница',
  slug text,
  description text not null default '',
  blocks jsonb not null default '[]'::jsonb,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, slug)
);

create table if not exists public.page_versions (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references public.pages (id) on delete cascade,
  title text not null,
  blocks jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists page_versions_page_id_idx on public.page_versions (page_id);

-- Снимок опубликованной страницы (публичный доступ по slug)
create table if not exists public.published_pages (
  page_id uuid primary key references public.pages (id) on delete cascade,
  slug text not null unique,
  title text not null,
  description text not null default '',
  blocks jsonb not null,
  published_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- Тарифы и подписки (Фаза 6: монетизация)
-- ============================================================
create table if not exists public.plans (
  id text primary key,
  name text not null,
  price_monthly numeric not null default 0,
  currency text not null default 'RUB',
  limits jsonb not null default '{}'::jsonb
);

insert into public.plans (id, name, price_monthly, currency, limits) values
  ('free', 'Бесплатный', 0, 'RUB', '{"max_pages": 1, "publish": false}'::jsonb),
  ('pro', 'Про', 490, 'RUB', '{"max_pages": 5, "publish": true}'::jsonb),
  ('business', 'Бизнес', 1990, 'RUB', '{"max_pages": -1, "publish": true}'::jsonb)
on conflict (id) do nothing;

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  plan_id text not null references public.plans (id),
  provider text not null,                -- 'yookassa' | 'rollypay'
  provider_subscription_id text,
  status text not null default 'pending',-- pending|active|past_due|canceled
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- Row Level Security
-- ============================================================
alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.pages enable row level security;
alter table public.page_versions enable row level security;
alter table public.published_pages enable row level security;
alter table public.plans enable row level security;
alter table public.subscriptions enable row level security;

create policy "own profile" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "own projects" on public.projects
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own pages" on public.pages
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own page versions" on public.page_versions
  for select using (
    exists (
      select 1 from public.pages p
      where p.id = page_versions.page_id and p.user_id = auth.uid()
    )
  );

create policy "public read published" on public.published_pages
  for select using (true);

create policy "own published" on public.published_pages
  for all using (
    exists (
      select 1 from public.pages p
      where p.id = published_pages.page_id and p.user_id = auth.uid()
    )
  );

create policy "read plans" on public.plans
  for select using (true);

create policy "own subscriptions" on public.subscriptions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
