/* @name createStubClientAccount */
-- Creates an "unclaimed" client account on behalf of an admin-created booking.
-- The email column is nullable so the admin can create the stub before knowing
-- the client's email. claimed_at stays NULL until the client sets a password
-- through the invitation/reset-password flow.
INSERT INTO client_accounts (
  email, display_name,
  phone,
  company_name, company_number, vat_number,
  address_street, address_number, address_zip, address_city, address_country,
  claimed_at, password_hash
)
VALUES (
  :email, :displayName!,
  :phone,
  :companyName, :companyNumber, :vatNumber,
  :addressStreet, :addressNumber, :addressZip, :addressCity, :addressCountry,
  NULL, NULL
)
RETURNING id, email, display_name
;
