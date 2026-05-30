/* @name getAgencySettings */
SELECT signature_image_path,
       name,
       representative,
       address,
       city,
       company_number,
       vat_number,
       email,
       iban
FROM agency_settings
WHERE id = TRUE
;
