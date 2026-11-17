-- 0017: tighten two policies found in the 2026-11-17 security audit.

-- ── 1) owner reads only their own team (+ themself) ─────────
-- 0011 let the owner select EVERY profile (incl. the web developer's email
-- and phone) — the app filtered, the database didn't.
drop policy if exists "owner read profiles" on profiles;
create policy "owner read profiles" on profiles for select
  using (auth_role() = 'owner' and (role in ('user','staff','receptionist') or id = auth.uid()));

-- ── 2) front desk: read + update bookings, no insert/delete ──
-- 0016 granted FOR ALL. The front desk confirms, completes, cancels and
-- reschedules; it never creates rows directly or hard-deletes history.
drop policy if exists "receptionist all bookings" on bookings;
drop policy if exists "receptionist read bookings" on bookings;
drop policy if exists "receptionist update bookings" on bookings;
create policy "receptionist read bookings" on bookings for select
  using (auth_role() = 'receptionist');
create policy "receptionist update bookings" on bookings for update
  using (auth_role() = 'receptionist') with check (auth_role() = 'receptionist');

-- …and may not re-point a booking at another customer account (that would
-- let a forged "completed" booking unlock a review on someone's account).
create or replace function protect_booking_owner() returns trigger
  language plpgsql security definer set search_path = public as $$
begin
  if auth_role() = 'receptionist' and new.user_id is distinct from old.user_id then
    new.user_id := old.user_id;
  end if;
  return new;
end; $$;
drop trigger if exists bookings_protect_owner on bookings;
create trigger bookings_protect_owner before update on bookings
  for each row execute function protect_booking_owner();
