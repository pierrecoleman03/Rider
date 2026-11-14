-- Rider beyond food: every item belongs to a category (food, experiences, travel, gifts, style).
alter table public.rider_items add column if not exists domain text not null default 'food'
  check (domain in ('food', 'exp', 'travel', 'gifts', 'style'));
create index if not exists rider_items_user_domain on public.rider_items (user_id, domain);
