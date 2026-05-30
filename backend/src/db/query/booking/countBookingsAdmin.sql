/* @name countBookingsAdmin */
SELECT COUNT(*)::int AS total
FROM bookings
WHERE (:statusFilter::text IS NULL OR status::text = :statusFilter::text)
  AND (:artistId::uuid IS NULL OR artist_id = :artistId::uuid)
;
