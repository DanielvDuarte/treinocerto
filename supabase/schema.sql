-- ============================================================
-- TreinoCerto — schema do banco (Supabase / PostgreSQL)
-- Rode isto em: Supabase Dashboard > SQL Editor > New query
-- ============================================================

-- Uma linha por usuário. Guardamos o estado do app em colunas JSONB.
-- É uma escolha pragmática para a v1: simples, segura e fácil de evoluir.
-- (Depois dá para normalizar em tabelas de workouts/sets/measurements.)

create table if not exists public.app_data (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  profile    jsonb,
  plan       jsonb,
  tracking   jsonb not null default '{"weightLog":[],"history":[]}'::jsonb,
  session    jsonb not null default '{"sets":{}}'::jsonb,
  chat       jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

-- Liga o Row Level Security: sem isso, qualquer um leria tudo.
alter table public.app_data enable row level security;

-- Cada usuário só enxerga e mexe na PRÓPRIA linha.
drop policy if exists "app_data_select_own" on public.app_data;
create policy "app_data_select_own"
  on public.app_data for select
  using (auth.uid() = user_id);

drop policy if exists "app_data_insert_own" on public.app_data;
create policy "app_data_insert_own"
  on public.app_data for insert
  with check (auth.uid() = user_id);

drop policy if exists "app_data_update_own" on public.app_data;
create policy "app_data_update_own"
  on public.app_data for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Mantém updated_at sempre atualizado.
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;

drop trigger if exists trg_app_data_touch on public.app_data;
create trigger trg_app_data_touch
  before update on public.app_data
  for each row execute function public.touch_updated_at();

-- Cria automaticamente a linha do usuário no primeiro login.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.app_data (user_id)
  values (new.id)
  on conflict (user_id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
