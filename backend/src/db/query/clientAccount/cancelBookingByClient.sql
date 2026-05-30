/* @name cancelBookingByClient */
-- Client cancels their own booking. The WHERE clause enforces three things at
-- once so a stale read from the dashboard can never cancel a booking the
-- client no longer owns, an already-terminal booking, or one too close to its
-- event date. `client_account_id` is the ownership guard; the IN clause keeps
-- terminal statuses (`cancelled`, `completed`) out; the interval check blocks
-- last-minute cancellations.
UPDATE bookings
SET status = 'cancelled',
    cancel_reason = :reason!,
    updated_at = NOW()
WHERE id = :bookingId!
  AND client_account_id = :clientId!
  AND status IN ('pending_validation', 'awaiting_deposit', 'confirmed')
  AND event_date > NOW() + make_interval(hours => :minLeadHours!)
RETURNING id, status, cancel_reason
;
