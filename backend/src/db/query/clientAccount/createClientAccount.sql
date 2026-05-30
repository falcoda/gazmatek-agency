/* @name createClientAccount */
INSERT INTO client_accounts (
  email, password_hash, display_name,
  phone,
  company_name, company_number, vat_number,
  address_street, address_number, address_zip, address_city, address_country
)
VALUES (
  :email!, :passwordHash!, :displayName,
  :phone,
  :companyName, :companyNumber, :vatNumber,
  :addressStreet, :addressNumber, :addressZip, :addressCity, :addressCountry
)
RETURNING id, email, display_name
;
