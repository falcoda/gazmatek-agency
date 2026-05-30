/* @name markEmailSent */
UPDATE email_deliveries
SET status = 'sent',
    sent_at = NOW(),
    attempts = attempts + 1
WHERE id = :emailId!
RETURNING id, status
;
