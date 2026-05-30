/* @name markEmailFailed */
UPDATE email_deliveries
SET status = CASE WHEN attempts + 1 >= 3 THEN 'abandoned' ELSE 'failed' END,
    attempts = attempts + 1,
    last_error = :lastError!,
    next_retry_at = NOW() + (
      CASE attempts
        WHEN 0 THEN INTERVAL '5 minutes'
        WHEN 1 THEN INTERVAL '30 minutes'
        ELSE INTERVAL '2 hours'
      END
    )
WHERE id = :emailId!
RETURNING id, status, attempts
;
