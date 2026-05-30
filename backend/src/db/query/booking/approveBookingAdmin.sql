/* @name approveBookingAdmin */
-- Admin approves a freshly-submitted booking. The booking moves from
-- `pending_validation` to `awaiting_deposit`: the agency is now waiting for
-- the client to wire the deposit, which the admin will manually mark paid
-- via `markBookingDepositPaid`.
UPDATE bookings
SET admin_approved_at = NOW(),
    status = 'awaiting_deposit',
    updated_at = NOW()
WHERE id = :bookingId!
  AND status = 'pending_validation'
  AND admin_approved_at IS NULL
RETURNING id, status, admin_approved_at
;
