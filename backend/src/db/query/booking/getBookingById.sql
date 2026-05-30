/* @name getBookingById */
SELECT
  b.id, b.artist_id,
  b.client_account_id,
  ca.email AS client_email,
  ca.display_name AS client_name,
  ca.phone AS client_phone,
  b.client_locale,
  b.event_date, b.event_duration_hours, b.event_location_address,
  b.event_location_lat, b.event_location_lng, b.event_context,
  b.capacity, b.ticket_price_cents, b.set_type,
  b.options,
  b.quoted_total_cents, b.deposit_amount_cents,
  b.status, b.admin_approved_at, b.validated_at,
  b.cancel_reason, b.paid_at,
  b.created_at, b.updated_at,
  a.slug AS artist_slug, a.stage_name AS artist_stage_name,
  ca.claimed_at AS client_claimed_at,
  ca.email AS client_account_email
FROM bookings b
JOIN artists a ON a.id = b.artist_id
LEFT JOIN client_accounts ca ON ca.id = b.client_account_id
WHERE b.id = :bookingId!
;
