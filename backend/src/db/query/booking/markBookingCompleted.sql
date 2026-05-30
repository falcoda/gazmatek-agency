/* @name markBookingCompleted */
-- Admin marks the booking as fully paid + done after the event. We also stamp
-- `paid_at` because at this point the balance has been received off-platform.
UPDATE bookings
SET status = 'completed',
    paid_at = NOW(),
    updated_at = NOW()
WHERE id = :bookingId!
  AND status = 'confirmed'
RETURNING id, status, paid_at
;
