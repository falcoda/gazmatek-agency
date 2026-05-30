/* @name countProducedEvents */
-- Bookings that materialized into real produced events: confirmed or completed.
SELECT COUNT(*)::int AS total
FROM bookings
WHERE status IN ('confirmed', 'completed')
;
