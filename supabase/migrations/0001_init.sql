-- Rider: the taste layer any app can plug into.
-- People own their rider. Partner apps read it live through scoped tokens and lose access the moment a connection is revoked.

create extension if not exists pgcrypto;

-- People ---------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null default '',
  onboarded boolean not null default false,
  created_at timestamptz not null default now()
);

create type public.rider_tier as enum ('never', 'rather', 'love');
create type public.rider_source as enum ('told', 'guess');

create table public.rider_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  label text not null,
  tier public.rider_tier not null,
  allergy boolean not null default false,
  source public.rider_source not null default 'told',
  confidence real check (confidence between 0 and 1),
  reason text,                 -- shown to the person: why Rider thinks this
  covers text[],               -- hidden ingredients this item also catches
  created_at timestamptz not null default now()
);
create index rider_items_user on public.rider_items (user_id);

-- Tasting Room ----------------------------------------------------------
create table public.dishes (
  id text primary key,
  name text not null,
  region text not null,
  area text not null,
  description text not null,
  image_url text,
  flavors jsonb not null default '[]',   -- [["Sour", 8], ...]
  variants text[] not null default '{}',
  contains text[] not null default '{}',
  sometimes text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table public.ratings (
  user_id uuid not null references auth.users (id) on delete cascade,
  dish_id text not null,
  score smallint check (score between 1 and 10),   -- null means "haven't tried it"
  rated_at timestamptz not null default now(),
  primary key (user_id, dish_id)
);

-- Partners --------------------------------------------------------------
create table public.partner_apps (
  id text primary key,
  name text not null,
  category text not null,
  description text not null default '',
  built_in boolean not null default false,
  client_secret_hash text,               -- sha256 of the client secret, null for built-in apps
  redirect_uris text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table public.connections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  app_id text not null references public.partner_apps (id),
  scopes text[] not null default '{never,rather,love}',
  token_hash text unique,                -- sha256 of the access token; the token itself is never stored
  connected_at timestamptz not null default now(),
  last_read_at timestamptz,
  revoked_at timestamptz
);
create unique index connections_active on public.connections (user_id, app_id) where revoked_at is null;

create table public.oauth_codes (
  code_hash text primary key,
  connection_id uuid not null references public.connections (id) on delete cascade,
  redirect_uri text not null,
  expires_at timestamptz not null default now() + interval '5 minutes',
  used_at timestamptz
);

-- Every partner read is logged so the person can see exactly who read their rider and when.
create table public.access_log (
  id bigint generated always as identity primary key,
  connection_id uuid not null references public.connections (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  app_id text not null,
  scopes text[] not null,
  read_at timestamptz not null default now()
);
create index access_log_user on public.access_log (user_id, read_at desc);

-- Row level security: people can only touch their own rows. Partner reads go through the service role on the server.
alter table public.profiles enable row level security;
alter table public.rider_items enable row level security;
alter table public.ratings enable row level security;
alter table public.connections enable row level security;
alter table public.access_log enable row level security;
alter table public.dishes enable row level security;
alter table public.partner_apps enable row level security;
alter table public.oauth_codes enable row level security;

create policy "own profile" on public.profiles for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "own items" on public.rider_items for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own ratings" on public.ratings for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own connections" on public.connections for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own access log" on public.access_log for select using (auth.uid() = user_id);
create policy "dishes are public" on public.dishes for select using (true);
create policy "apps are public" on public.partner_apps for select using (true);
-- oauth_codes: no policies, so only the service role can read or write them.

-- Create a profile row when someone signs up.
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', ''));
  return new;
end;
$$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Seed partner apps. itin is built in; the others are categories until real partners sign up.
insert into public.partner_apps (id, name, category, description, built_in) values
  ('itin', 'itin', 'Restaurant picks', 'Built in. Your picks already use your rider.', true),
  ('delivery', 'Food delivery', 'Delivery', 'Gray out dishes that break your rider', false),
  ('reservations', 'Reservations', 'Reservations', 'Send your rider with every booking', false),
  ('hotels', 'Hotels', 'Hotels', 'Room service and the concierge know', false);
