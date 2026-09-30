-- 0013: profiles.email is no longer self-editable.
-- "self update profile" (0003) has no column restriction and the privilege
-- trigger only guarded role/stylist_id, so a user could set their own
-- profiles.email to someone else's address and be picked up by the staff
-- invite lookup. Email now follows auth.users and only an admin can change it.

-- ── 1) resync any drifted/spoofed values (must run BEFORE the trigger
--       change below, which would revert this update too) ──────────
update profiles p
   set email = u.email
  from auth.users u
 where u.id = p.id
   and p.email is distinct from u.email;

-- ── 2) privilege trigger: also pin email for every non-admin actor ──
create or replace function protect_profile_privileges() returns trigger
  language plpgsql security definer set search_path = public as $$
begin
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
