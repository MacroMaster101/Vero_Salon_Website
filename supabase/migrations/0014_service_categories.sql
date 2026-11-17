-- 0014: service categories become editable rows instead of a fixed
-- 'hair' | 'beauty' check. Admins/owners add, rename, reorder and remove
-- categories; every service points at one by slug.

create table if not exists service_categories (
  slug        text primary key check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name        text not null check (length(name) between 1 and 60),
  note        text not null default '',
  image_url   text,
  icon        text not null default 'scissors',
  sort_order  int  not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

alter table service_categories enable row level security;

drop policy if exists "public read categories" on service_categories;
create policy "public read categories" on service_categories
  for select using (true);

drop policy if exists "admin write categories" on service_categories;
create policy "admin write categories" on service_categories for all
  using (auth_role() in ('admin','owner')) with check (auth_role() in ('admin','owner'));

-- the three groups the website already shows
insert into service_categories (slug, name, note, image_url, icon, sort_order) values
  ('hair',     'Hair & styling',   'A fresh look for every age.',    '/images/services/hair.png',   'scissors', 1),
  ('grooming', 'Beard & grooming', 'Sharp fades and tidy beards.',   '/images/services/beard.png',  'user',     2),
  ('beauty',   'Beauty & bridal',  'Everyday care to your big day.', '/images/services/bridal.png', 'star',     3)
on conflict (slug) do nothing;

-- services.category now references a category row (renaming a slug cascades;
-- a category that still has services cannot be deleted)
alter table services drop constraint if exists services_category_check;
alter table services drop constraint if exists services_category_fkey;
alter table services add constraint services_category_fkey
  foreign key (category) references service_categories(slug)
  on update cascade on delete restrict;

-- beard / shave services were shown under "grooming" by a name match; make it real
update services set category = 'grooming'
  where name ~* '(beard|shav|moustache)' or slug ~* '(beard|shav|moustache)';
