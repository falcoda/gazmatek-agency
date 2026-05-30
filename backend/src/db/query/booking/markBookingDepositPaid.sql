/* @name markBookingDepositPaid */
-- Admin manually confirms that the deposit has been received (bank transfer,
-- cash, etc.). Booking moves from `awaiting_deposit` to `confirmed`, which
-- locks the slot and unlocks the contract flow.
UPDATE bookings
SET status = 'confirmed',
    updated_at = NOW()
WHERE id = :bookingId!
  AND status = 'awaiting_deposit'
RETURNING id, status
;
