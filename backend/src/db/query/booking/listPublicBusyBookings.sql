/* @name listPublicBusyBookings */
-- Narrower counterpart of listBookingsOverlapping for the PUBLIC availability
-- calendar (#17). It deliberately excludes `pending_validation` so unreviewed
-- requests are never disclosed through the public calendar. Only confirmed and
-- awaiting_deposit bookings mark a public day busy.
SELECT id, event_date, event_duration_hours, status
FROM bookings
WHERE artist_id = :artistId!
  AND status IN ('confirmed', 'awaiting_deposit')
  AND tstzrange(event_date, event_date + (event_duration_hours || ' hours')::interval, '[)')
      && tstzrange(:rangeStart!, :rangeEnd!, '[)')
;
