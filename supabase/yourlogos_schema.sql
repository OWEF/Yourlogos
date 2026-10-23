-- YourLogos V2.4: dedicated Supabase project only.
-- DO NOT run against ZA Portfolio, CryptoComply, or any existing unrelated project.
-- This is a reviewable schema proposal, not yet applied to a live database.
create extension if not exists pgcrypto;

create table if not exists public.quotes (
  legacy_id integer primary key check (legacy_id >= 0),
  quote_text text not null check (length(quote_text) between 1 and 3000),
  author text not null,
  theme text not null,
  source text not null,
  reflection_prompt text not null,
  source_url text,
  review_status text not null default 'pending' check (review_status in ('pending','verified','excluded')),
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.quotes enable row level security;
revoke all on public.quotes from anon, authenticated;
grant select on public.quotes to anon, authenticated;
drop policy if exists "published quotes readable" on public.quotes;
create policy "published quotes readable" on public.quotes for select to anon, authenticated
  using (is_published = true);
-- Editorial writes are deliberately NOT permitted to anonymous browser clients.

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 32),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
revoke all on public.profiles from anon, authenticated;
grant select, insert, update, delete on public.profiles to authenticated;
drop policy if exists "profiles owner select" on public.profiles;
create policy "profiles owner select" on public.profiles for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "profiles owner insert" on public.profiles;
create policy "profiles owner insert" on public.profiles for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists "profiles owner update" on public.profiles;
create policy "profiles owner update" on public.profiles for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists "profiles owner delete" on public.profiles;
create policy "profiles owner delete" on public.profiles for delete to authenticated using ((select auth.uid()) = user_id);

-- User-owned per-device practice snapshot, for an explicit opt-in migration later.
-- No anonymous account may read or write another user's data.
create table if not exists public.user_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  state jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  constraint max_state_size check (octet_length(state::text) <= 1000000)
);
alter table public.user_state enable row level security;
revoke all on public.user_state from anon, authenticated;
grant select, insert, update, delete on public.user_state to authenticated;
drop policy if exists "state owner select" on public.user_state;
create policy "state owner select" on public.user_state for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "state owner insert" on public.user_state;
create policy "state owner insert" on public.user_state for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists "state owner update" on public.user_state;
create policy "state owner update" on public.user_state for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists "state owner delete" on public.user_state;
create policy "state owner delete" on public.user_state for delete to authenticated using ((select auth.uid()) = user_id);

-- Owner-scoped semantic relationships, not anonymous or global personality labels.
create table if not exists public.user_links (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  source_concept text not null,
  target_concept text not null,
  relation_type text not null default 'explored',
  explanation text,
  event_date date not null default current_date,
  created_at timestamptz not null default now(),
  constraint distinct_concepts check(source_concept <> target_concept)
);
create index if not exists user_links_owner on public.user_links(user_id, event_date desc);
alter table public.user_links enable row level security;
revoke all on public.user_links from anon, authenticated;
grant select, insert, update, delete on public.user_links to authenticated;
drop policy if exists "links owner select" on public.user_links;
create policy "links owner select" on public.user_links for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "links owner insert" on public.user_links;
create policy "links owner insert" on public.user_links for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists "links owner update" on public.user_links;
create policy "links owner update" on public.user_links for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists "links owner delete" on public.user_links;
create policy "links owner delete" on public.user_links for delete to authenticated using ((select auth.uid()) = user_id);
