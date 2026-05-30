/* @name setEngagementSigningInfo */
UPDATE contracts
SET signature_provider = :provider!,
    signature_provider_envelope_id = :envelopeId!,
    pdf_storage_key = :pdfStorageKey!,
    status = 'pending_signature',
    updated_at = NOW()
WHERE id = :contractId!
  AND kind = 'engagement'
RETURNING id, status, signature_provider, signature_provider_envelope_id
;
