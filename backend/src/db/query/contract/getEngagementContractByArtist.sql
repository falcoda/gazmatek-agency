/* @name getEngagementContractByArtist */
SELECT id, artist_id, pdf_storage_key, status,
       signature_provider, signature_provider_envelope_id,
       signed_at, signed_pdf_storage_key,
       created_at, updated_at
FROM contracts
WHERE artist_id = :artistId!
  AND kind = 'engagement'
ORDER BY created_at DESC
LIMIT 1
;
