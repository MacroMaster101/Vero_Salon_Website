-- 0016: retire 'admin', add 'receptionist' — the front desk.
--
-- Receptionist = bookings (confirm, done, no-show, cancel, reschedule),
-- blocked times and holidays. NOT services/prices, stylists, photos,
-- reviews, site content or anyone's access — those are owner/webdev.
--
-- Why the existing policies need no rewrite: auth_role() (0015) reports a
-- webdev as 'admin'. Once no stored row is 'admin', every
-- `auth_role() = 'admin'` rule means "webdev only", and every
-- `in ('admin','owner')` rule means "webdev or owner" — exactly the new
-- split. Receptionist only needs its own front-desk grants below.

-- ── 1) role values: admin → receptionist ────────────────────
alter table profiles disable trigger profiles_protect_privileges;
alter table profiles drop constraint if exists profiles_role_check;
update profiles set role = 'receptionist' where role = 'admin';
alter table profiles add constraint profiles_role_check
  check (role in ('user','staff','receptionist','owner','webdev'));
alter table profiles enable trigger profiles_protect_privileges;

-- ── 2) front-desk grants ────────────────────────────────────
drop policy if exists "receptionist all bookings" on bookings;
create policy "receptionist all bookings" on bookings for all
  using (auth_role() = 'receptionist') with check (auth_role() = 'receptionist');

drop policy if exists "receptionist all blocks" on blocked_slots;
create policy "receptionist all blocks" on blocked_slots for all
  using (auth_role() = 'receptionist') with check (auth_role() = 'receptionist');

drop policy if exists "receptionist all holidays" on holidays;
create policy "receptionist all holidays" on holidays for all
  using (auth_role() = 'receptionist') with check (auth_role() = 'receptionist');

-- ── 3) the owner hires/moves front-desk staff too ───────────
drop policy if exists "owner update team profiles" on profiles;
create policy "owner update team profiles" on profiles for update
  using (auth_role() = 'owner' and role in ('user','staff','receptionist'))
  with check (auth_role() = 'owner' and role in ('user','staff','receptionist'));

-- ── 4) privilege trigger (0015 + receptionist in the owner's team) ──
create or replace function protect_profile_privileges() returns trigger
  language plpgsql security definer set search_path = public as $$
begin
  if (old.role = 'webdev' or new.role = 'webdev') and auth_real_role() <> 'webdev' then
    new.role := old.role;
    new.stylist_id := old.stylist_id;
    new.email := old.email;
    return new;
  end if;
  if auth_role() = 'admin' then          -- i.e. a webdev
    return new;
  end if;
  new.email := old.email;
  if auth_role() = 'owner'
     and old.role in ('user','staff','receptionist')
     and new.role in ('user','staff','receptionist') then
    return new;
  end if;
  new.role := old.role;
  new.stylist_id := old.stylist_id;
  return new;
end; $$;
