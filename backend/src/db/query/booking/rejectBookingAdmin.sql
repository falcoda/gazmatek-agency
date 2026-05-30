/* @name rejectBookingAdmin */
-- Admin rejects/cancels a booking. Allowed from any non-terminal state:
-- a freshly-submitted request (`pending_validation`), one awaiting its deposit
-- (`awaiting_deposit`), or an already-confirmed booking that has to be called
-- off (event cancelled, force majeure, client backing out after the deposit).
UPDATE bookings
SET status = 'cancelled',
    cancel_reason = :reason!,
    updated_at = NOW()
WHERE id = :bookingId!
  AND status IN ('pending_validation', 'awaiting_deposit', 'confirmed')
RETURNING id, status, cancel_reason
;
