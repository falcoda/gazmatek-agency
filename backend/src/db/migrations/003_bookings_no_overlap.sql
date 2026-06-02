-- #5 Double-booking race: enforce non-overlap of active bookings per artist at
-- the database level so a check-then-insert race can never produce two
-- overlapping bookings for the same artist. The application still runs a
-- pre-check for a friendly error, but this constraint is the real guarantee.
--
-- `btree_gist` lets us mix the equality operator on artist_id with the range
-- overlap operator (&&) inside a single EXCLUDE constraint.
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- The booking end instant cannot be expressed inline in the index because
-- `timestamptz + interval` is only STABLE (it can depend on the session
-- timezone at DST boundaries). We wrap the slot computation in an IMMUTABLE
-- function: Postgres trusts the declared volatility, and epoch-based arithmetic
-- is timezone-independent so the result is genuinely stable.
CREATE OR REPLACE FUNCTION booking_slot_range(
  event_date timestamptz,
  duration_hours numeric
)
RETURNS tstzrange
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT tstzrange(
    event_date,
    to_timestamp(extract(epoch FROM event_date) + duration_hours * 3600),
    '[)'
  );
$$;

-- Only "active" statuses occupy the slot. A cancelled booking frees the slot,
-- so it is excluded from the constraint via the WHERE predicate. Matches
-- ACTIVE_BOOKING_STATUSES in src/services/bookings/bookingConstants.ts.
ALTER TABLE bookings
  ADD CONSTRAINT bookings_no_overlap
  EXCLUDE USING gist (
    artist_id WITH =,
    booking_slot_range(event_date, event_duration_hours) WITH &&
  )
  WHERE (status IN ('pending_validation', 'awaiting_deposit', 'confirmed'));
