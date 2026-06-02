/* @name listArtistBookings */
-- RGPD masking (#48): the client's display name is only revealed once the
-- booking is confirmed or completed — same rule getBookingDetail applies. Before
-- that, the artist sees the slot but not who the client is.
SELECT
  b.id, b.artist_id,
  CASE
    WHEN b.status IN ('confirmed', 'completed') THEN ca.display_name
    ELSE NULL
  END AS client_name,
  CASE
    WHEN b.status IN ('confirmed', 'completed') THEN ca.email
    ELSE NULL
  END AS client_email,
  b.event_date, b.event_duration_hours,
  b.event_location_address, b.quoted_total_cents, b.deposit_amount_cents,
  b.status, b.paid_at, b.created_at
FROM bookings b
LEFT JOIN client_accounts ca ON ca.id = b.client_account_id
WHERE b.artist_id = :artistId!
  AND (
    (:upcoming::boolean = TRUE AND b.event_date >= NOW() AND b.status IN ('confirmed','awaiting_deposit','pending_validation'))
    OR (:upcoming::boolean = FALSE AND (b.event_date < NOW() OR b.status = 'completed' OR b.status = 'cancelled'))
  )
ORDER BY b.event_date DESC
LIMIT :pageLimit!
OFFSET :pageOffset!
;
