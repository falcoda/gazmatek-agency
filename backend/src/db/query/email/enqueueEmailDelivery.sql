/* @name enqueueEmailDelivery */
INSERT INTO email_deliveries (template, recipient, locale, payload, status, next_retry_at)
VALUES (:template!, :recipient!, :locale!, :payload!, 'pending', NOW())
RETURNING id, status
;
