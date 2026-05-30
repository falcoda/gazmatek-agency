/* @name listBookingsOverlapping */
SELECT id, event_date, event_duration_hours, status
FROM bookings
WHERE artist_id = :artistId!
  AND status IN ('confirmed', 'awaiting_deposit', 'pending_validation')
  AND tstzrange(event_date, event_date + (event_duration_hours || ' hours')::interval, '[)')
      && tstzrange(:rangeStart!, :rangeEnd!, '[)')
;
