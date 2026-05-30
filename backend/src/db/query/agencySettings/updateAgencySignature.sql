/* @name updateAgencySignature */
UPDATE agency_settings
SET signature_image_path = :signatureImagePath,
    updated_at = NOW()
WHERE id = TRUE
RETURNING signature_image_path
;
