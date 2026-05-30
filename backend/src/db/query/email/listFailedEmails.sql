/* @name listFailedEmails */
SELECT id, template, recipient, locale, payload, attempts
FROM email_deliveries
WHERE status = 'failed'
  AND next_retry_at <= NOW()
ORDER BY next_retry_at ASC
LIMIT :pageLimit!
;
