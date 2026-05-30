/* @name updateBookingAdmin */
UPDATE bookings
SET event_date = COALESCE(:eventDate, event_date),
    event_duration_hours = COALESCE(:eventDurationHours, event_duration_hours),
    event_location_address = COALESCE(:eventLocationAddress, event_location_address),
    event_context = COALESCE(:eventContext, event_context),
    quoted_total_cents = COALESCE(:quotedTotalCents, quoted_total_cents),
    deposit_amount_cents = COALESCE(:depositAmountCents, deposit_amount_cents),
    updated_at = NOW()
WHERE id = :bookingId!
RETURNING id, status, updated_at
;
