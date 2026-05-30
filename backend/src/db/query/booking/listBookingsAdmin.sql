/* @name listBookingsAdmin */
SELECT
  b.id, b.artist_id, a.stage_name AS artist_stage_name,
  ca.email AS client_email,
  ca.display_name AS client_name,
  b.event_date, b.event_duration_hours,
  b.event_location_address, b.quoted_total_cents, b.deposit_amount_cents,
  b.status, b.paid_at, b.created_at
FROM bookings b
JOIN artists a ON a.id = b.artist_id
LEFT JOIN client_accounts ca ON ca.id = b.client_account_id
WHERE (:statusFilter::text IS NULL OR b.status::text = :statusFilter::text)
  AND (:artistId::uuid IS NULL OR b.artist_id = :artistId::uuid)
ORDER BY b.created_at DESC
LIMIT :pageLimit!
OFFSET :pageOffset!
;
