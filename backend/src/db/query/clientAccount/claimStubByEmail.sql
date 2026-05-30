/* @name claimStubByEmail */
-- Convert an existing stub (claimed_at IS NULL) into a fully activated account.
-- Used when a user signs up through the public form with an email that already
-- matches an admin-created stub. The stub's display_name / phone / company info
-- are preserved if already set; otherwise we apply the new signup values.
UPDATE client_accounts
SET password_hash = :passwordHash!,
    claimed_at = NOW(),
    display_name = COALESCE(NULLIF(display_name, ''), :displayName!),
    phone = COALESCE(phone, :phone),
    company_name = COALESCE(company_name, :companyName),
    company_number = COALESCE(company_number, :companyNumber),
    vat_number = COALESCE(vat_number, :vatNumber),
    address_street = COALESCE(address_street, :addressStreet),
    address_number = COALESCE(address_number, :addressNumber),
    address_zip = COALESCE(address_zip, :addressZip),
    address_city = COALESCE(address_city, :addressCity),
    address_country = COALESCE(address_country, :addressCountry)
WHERE id = :clientId!
  AND claimed_at IS NULL
RETURNING id, email, display_name
;
