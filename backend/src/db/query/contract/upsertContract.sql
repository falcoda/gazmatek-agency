/* @name upsertContract */
INSERT INTO contracts (booking_id, pdf_storage_key, status)
VALUES (:bookingId!, :pdfStorageKey!, 'pending_signature')
ON CONFLICT (booking_id)
DO UPDATE SET
  pdf_storage_key = EXCLUDED.pdf_storage_key,
  status = 'pending_signature',
  signature_provider_envelope_id = NULL,
  signed_at = NULL,
  signed_pdf_storage_key = NULL,
  updated_at = NOW()
RETURNING id, booking_id, pdf_storage_key, status, updated_at
;
