/* @name updateAgencyInfo */
UPDATE agency_settings
SET name = :name,
    representative = :representative,
    address = :address,
    city = :city,
    company_number = :companyNumber,
    vat_number = :vatNumber,
    email = :email,
    iban = :iban,
    updated_at = NOW()
WHERE id = TRUE
RETURNING signature_image_path,
          name,
          representative,
          address,
          city,
          company_number,
          vat_number,
          email,
          iban
;
