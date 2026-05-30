/* @name createBooking */
-- Public bookings land in `pending_validation` so an admin can manually review
-- before transitioning the booking to `awaiting_deposit`, `confirmed`, etc.
-- All payment tracking is done by the admin off-platform; there is no Stripe
-- (or any automated) payment step.
INSERT INTO bookings (
  artist_id, client_account_id,
  client_locale,
  event_date, event_duration_hours, event_location_address,
  event_location_lat, event_location_lng, event_context,
  capacity, ticket_price_cents, set_type,
  options,
  quoted_total_cents, deposit_amount_cents,
  status
)
VALUES (
  :artistId!, :clientAccountId!,
  :clientLocale!,
  :eventDate!, :eventDurationHours!, :eventLocationAddress!,
  :eventLocationLat, :eventLocationLng, :eventContext,
  :capacity!, :ticketPriceCents!, :setType!::artist_set_type,
  :options!,
  :quotedTotalCents!, :depositAmountCents!,
  COALESCE(:status, 'pending_validation')::booking_status
)
RETURNING id, status, created_at
;
