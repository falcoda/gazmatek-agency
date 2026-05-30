/* @name getContractByEnvelopeId */
SELECT id, kind, artist_id, booking_id, pdf_storage_key, status,
       signature_provider, signature_provider_envelope_id,
       signed_at, signed_pdf_storage_key,
       created_at, updated_at
FROM contracts
WHERE signature_provider_envelope_id = :envelopeId!
LIMIT 1
;
