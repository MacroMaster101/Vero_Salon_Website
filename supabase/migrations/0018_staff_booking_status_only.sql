-- 0018: staff may change only the STATUS of bookings on their own chair.
--
-- The 0003 policy "staff update bookings" lets a staff JWT update any column
-- of a booking whose stylist_id is theirs. Calling PostgREST directly, a
-- stylist could move a booking onto another account (user_id) and mark it
-- completed — unlocking a review of themselves — or rewrite price, times or
-- customer contact details.
--
-- Who needs staff UPDATE through RLS:
--   * mobile app: lib/api/staff.ts → bookings.update({ status }) only
--   * website: staff actions use the service-role client (auth_role() is null
--     there, so this trigger leaves them alone)
-- So the staff branch keeps every column as it was except `status`. The
-- receptionist branch from 0017 (user_id pinned) is kept unchanged.
-- The status value itself is still limited by the bookings check constraint.

create or replace function protect_booking_owner() returns trigger
  language plpgsql security definer set search_path = public as $$
declare
  new_status text;
begin
  if auth_role() = 'staff' then
    new_status := new.status;
    new := old;              -- discard every other change
    new.status := new_status;
  elsif auth_role() = 'receptionist' and new.user_id is distinct from old.user_id then
    new.user_id := old.user_id;
  end if;
  return new;
end; $$;

-- trigger already exists from 0017; recreate so this migration stands alone
drop trigger if exists bookings_protect_owner on bookings;
create trigger bookings_protect_owner before update on bookings
  for each row execute function protect_booking_owner();
