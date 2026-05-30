/* @name markContractSigned */
UPDATE contracts
SET status = 'signed',
    signed_at = NOW(),
    signed_pdf_storage_key = :signedPdfStorageKey!,
    updated_at = NOW()
WHERE id = :contractId!
  AND status = 'pending_signature'
RETURNING id, status, signed_at
;
