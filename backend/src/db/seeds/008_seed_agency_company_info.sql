-- Seed: realistic dev test data for the singleton `agency_settings` row so the
-- engagement-contract PDF is fully prefilled on the agency side and the admin
-- settings page shows real values out of the box.
UPDATE agency_settings
SET name = COALESCE(name, 'Gazmatek Universe Booking'),
    representative = COALESCE(representative, 'Thomas Gozes'),
    address = COALESCE(address, 'Rue des Bogards 12, 1000 Bruxelles'),
    company_number = COALESCE(company_number, '0789.456.123'),
    vat_number = COALESCE(vat_number, 'BE0789.456.123'),
    email = COALESCE(email, 'thomas@gazmatek.be'),
    iban = COALESCE(iban, 'BE68 5390 0754 7034'),
    updated_at = NOW()
WHERE id = TRUE
;
