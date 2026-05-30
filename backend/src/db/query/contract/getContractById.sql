/* @name getContractById */
SELECT c.id, c.booking_id, c.pdf_storage_key, c.status,
       c.signature_provider, c.signature_provider_envelope_id,
       c.signed_at, c.signed_pdf_storage_key,
       c.last_reminder_at, c.created_at, c.updated_at,
       b.artist_id
FROM contracts c
JOIN bookings b ON b.id = c.booking_id
WHERE c.id = :contractId!
LIMIT 1
;
