/* @name getContractByBookingId */
SELECT id, booking_id, pdf_storage_key, status, signature_provider,
       signature_provider_envelope_id, signed_at, signed_pdf_storage_key,
       last_reminder_at, created_at, updated_at
FROM contracts
WHERE booking_id = :bookingId!
LIMIT 1
;
