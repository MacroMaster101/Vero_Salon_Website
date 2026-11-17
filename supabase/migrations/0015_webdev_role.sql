-- 0015: 'webdev' — the site developer's role, above every other role.
-- In the database a webdev acts as an admin everywhere (auth_role() reports
-- 'admin', so every existing policy and the privilege trigger apply), and
-- only another webdev can change or grant a webdev account.

-- ── 1) profiles.role accepts 'webdev' ───────────────────────
alter table profiles drop constraint if exists profiles_role_check;
alter table profiles add constraint profiles_role_check
  check (role in ('user','staff','admin','owner','webdev'));

-- ── 2) the stored role, untranslated ────────────────────────
create or replace function auth_real_role() returns text
  language sql stable security definer set search_path = public as $$
  select coalesce((select role from profiles where id = auth.uid()), 'user');
$$;

-- ── 3) RLS sees a webdev as an admin ────────────────────────
create or replace function auth_role() returns text
  language sql stable security definer set search_path = public as $$
  select case when auth_real_role() = 'webdev' then 'admin' else auth_real_role() end;
$$;

-- ── 4) privilege trigger: nobody but a webdev touches webdev ─
create or replace function protect_profile_privileges() returns trigger
  language plpgsql security definer set search_path = public as $$
begin
  if (old.role = 'webdev' or new.role = 'webdev') and auth_real_role() <> 'webdev' then
    new.role := old.role;
    new.stylist_id := old.stylist_id;
    new.email := old.email;
    return new;
  end if;
  if auth_role() = 'admin' then
    return new;
  end if;
  new.email := old.email;
  if auth_role() = 'owner'
     and old.role in ('user','staff')
     and new.role in ('user','staff') then
    return new;
  end if;
  new.role := old.role;
  new.stylist_id := old.stylist_id;
  return new;
end; $$;

-- ── 5) one-time: make the developer's login a webdev ────────
alter table profiles disable trigger profiles_protect_privileges;
update profiles set role = 'webdev' where email = 'kldevsupport@gmail.com';
alter table profiles enable trigger profiles_protect_privileges;
