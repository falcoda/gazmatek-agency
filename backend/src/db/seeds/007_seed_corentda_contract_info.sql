-- Seed (DEV ONLY): contract/billing info for the demo artist so the
-- engagement-contract PDF is fully prefilled in dev (no blanks left).
UPDATE artists
SET full_name = COALESCE(full_name, 'Demo Artist'),
    phone = COALESCE(phone, '+32 470 00 00 00'),
    address = COALESCE(address, 'Rue de la Station 1, 1000 Bruxelles'),
    country = COALESCE(country, 'Belgique'),
    vat_number = COALESCE(vat_number, 'BE0123.456.789'),
    company_number = COALESCE(company_number, '0123.456.789'),
    updated_at = NOW()
WHERE slug = 'corentda'
;
