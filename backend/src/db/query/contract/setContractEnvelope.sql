/* @name setContractEnvelope */
UPDATE contracts
SET signature_provider = :provider!,
    signature_provider_envelope_id = :envelopeId!,
    updated_at = NOW()
WHERE id = :contractId!
RETURNING id, signature_provider_envelope_id
;
