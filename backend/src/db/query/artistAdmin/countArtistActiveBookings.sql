/* @name countArtistActiveBookings */
SELECT COUNT(*)::int AS total
FROM bookings
WHERE artist_id = :artistId!
  AND status IN ('pending_validation', 'awaiting_deposit', 'confirmed')
;
