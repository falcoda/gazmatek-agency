/* @name editBookingByClient */
-- #30 Client edits their own booking. Like cancelBookingByClient, the WHERE
-- clause enforces ownership and the allowed status atomically: only a booking
-- the client owns AND still in `pending_validation` can be edited. Editable
-- fields use COALESCE so an absent field is left untouched. event_date/duration
-- changes are guarded against the active-booking overlap by the EXCLUDE
-- constraint (#5), surfaced as a conflict by the service.
UPDATE bookings
SET event_date = COALESCE(:eventDate, event_date),
    event_duration_hours = COALESCE(:eventDurationHours, event_duration_hours),
    event_location_address = COALESCE(:eventLocationAddress, event_location_address),
    event_location_lat = COALESCE(:eventLocationLat, event_location_lat),
    event_location_lng = COALESCE(:eventLocationLng, event_location_lng),
    event_context = COALESCE(:eventContext, event_context),
    capacity = COALESCE(:capacity, capacity),
    ticket_price_cents = COALESCE(:ticketPriceCents, ticket_price_cents),
    updated_at = NOW()
WHERE id = :bookingId!
  AND client_account_id = :clientId!
  AND status = 'pending_validation'
RETURNING id, status, event_date, event_duration_hours,
          event_location_address, event_context, capacity,
          ticket_price_cents, quoted_total_cents, created_at
;
