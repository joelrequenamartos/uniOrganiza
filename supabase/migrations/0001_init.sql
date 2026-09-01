-- uniOrganiza — initial schema
-- Phase 2. Run once in Supabase → SQL Editor.

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
create type event_type   as enum ('class', 'assignment', 'activity', 'exam');
create type event_source as enum ('manual', 'university');
create type event_status as enum ('pending', 'completed', 'read_only');

-- ---------------------------------------------------------------------------
-- profiles  (1 row per auth user)
-- ---------------------------------------------------------------------------
create table profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  timezone   text not null default 'Europe/Madrid',
  created_at timestamptz not null default now()
);

-- Create a profile automatically when a user signs up.
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id) values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ---------------------------------------------------------------------------
-- subjects
-- ---------------------------------------------------------------------------
create table subjects (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users (id) on delete cascade,
  name         text not null check (char_length(trim(name)) > 0),
  color        text not null default '#7aa2f7',
  external_ref text,
  created_at   timestamptz not null default now()
);

create index idx_subjects_user on subjects (user_id);

-- ---------------------------------------------------------------------------
-- events  (polymorphic: class | assignment | activity | exam)
-- ---------------------------------------------------------------------------
create table events (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  subject_id  uuid references subjects (id) on delete set null,
  type        event_type not null,
  title       text not null check (char_length(trim(title)) > 0),
  description text,
  start_at    timestamptz,
  end_at      timestamptz,
  due_at      timestamptz,
  all_day     boolean not null default false,
  status      event_status not null default 'pending',
  source      event_source not null default 'manual',
  external_id text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),

  -- An event needs at least one anchoring instant.
  constraint chk_has_instant check (start_at is not null or due_at is not null),
  -- end_at only makes sense alongside start_at, and after it.
  constraint chk_end_after_start
    check (end_at is null or (start_at is not null and end_at >= start_at)),
  -- Classes are never hand-created; they come from the university feed.
  constraint chk_manual_not_class
    check (source = 'university' or type <> 'class'),
  -- read_only is reserved for imported events.
  constraint chk_readonly_is_external
    check (status <> 'read_only' or source = 'university')
);

-- Idempotent university sync: one row per (user, source, external id).
create unique index uniq_events_external
  on events (user_id, source, external_id)
  where external_id is not null;

create index idx_events_user_due          on events (user_id, due_at);
create index idx_events_user_start        on events (user_id, start_at);
create index idx_events_user_type_status  on events (user_id, type, status);

-- keep updated_at fresh
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger events_set_updated_at
  before update on events
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- external_calendars  (abstraction for Phase 9 — no rows yet)
-- ---------------------------------------------------------------------------
create table external_calendars (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users (id) on delete cascade,
  provider       text not null check (provider in ('ics', 'google')),
  url            text,
  name           text,
  last_synced_at timestamptz,
  sync_state     jsonb,
  created_at     timestamptz not null default now()
);

create index idx_external_calendars_user on external_calendars (user_id);

-- ---------------------------------------------------------------------------
-- Row Level Security — every user sees only their own data
-- ---------------------------------------------------------------------------
alter table profiles           enable row level security;
alter table subjects           enable row level security;
alter table events             enable row level security;
alter table external_calendars enable row level security;

create policy "own profile - select" on profiles
  for select using (id = auth.uid());
create policy "own profile - update" on profiles
  for update using (id = auth.uid()) with check (id = auth.uid());
create policy "own profile - insert" on profiles
  for insert with check (id = auth.uid());

create policy "own subjects - all" on subjects
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "own events - all" on events
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "own calendars - all" on external_calendars
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
