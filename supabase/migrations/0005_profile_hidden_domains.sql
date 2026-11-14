-- Categories the person has switched off for apps. Hidden categories are never returned by the partner API.
alter table public.profiles add column if not exists hidden_domains text[] not null default '{}';
