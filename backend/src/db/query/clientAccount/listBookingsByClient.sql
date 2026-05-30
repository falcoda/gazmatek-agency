/* @name listBookingsByClient */
SELECT b.id, b.status,
       b.event_date, b.event_duration_hours,
       b.event_location_address,
       b.event_context,
       b.quoted_total_cents,
       b.created_at,
       a.id AS artist_id, a.slug AS artist_slug, a.stage_name AS artist_stage_name,
       a.cover_image_url AS artist_cover_image_url
FROM bookings b
JOIN artists a ON a.id = b.artist_id
WHERE b.client_account_id = :clientId!
ORDER BY b.event_date DESC
;
