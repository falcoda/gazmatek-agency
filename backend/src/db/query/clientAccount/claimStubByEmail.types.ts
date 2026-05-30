/** Types generated for queries found in "src/db/query/clientAccount/claimStubByEmail.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'ClaimStubByEmail' parameters type */
export interface IClaimStubByEmailParams {
  addressCity?: string | null | void;
  addressCountry?: string | null | void;
  addressNumber?: string | null | void;
  addressStreet?: string | null | void;
  addressZip?: string | null | void;
  clientId: string;
  companyName?: string | null | void;
  companyNumber?: string | null | void;
  displayName: string;
  passwordHash: string;
  phone?: string | null | void;
  vatNumber?: string | null | void;
}

/** 'ClaimStubByEmail' return type */
export interface IClaimStubByEmailResult {
  display_name: string | null;
  email: string | null;
  id: string;
}

/** 'ClaimStubByEmail' query type */
export interface IClaimStubByEmailQuery {
  params: IClaimStubByEmailParams;
  result: IClaimStubByEmailResult;
}

const claimStubByEmailIR: any = {"usedParamSet":{"passwordHash":true,"displayName":true,"phone":true,"companyName":true,"companyNumber":true,"vatNumber":true,"addressStreet":true,"addressNumber":true,"addressZip":true,"addressCity":true,"addressCountry":true,"clientId":true},"params":[{"name":"passwordHash","required":true,"transform":{"type":"scalar"},"locs":[{"a":360,"b":373}]},{"name":"displayName","required":true,"transform":{"type":"scalar"},"locs":[{"a":454,"b":466}]},{"name":"phone","required":false,"transform":{"type":"scalar"},"locs":[{"a":498,"b":503}]},{"name":"companyName","required":false,"transform":{"type":"scalar"},"locs":[{"a":549,"b":560}]},{"name":"companyNumber","required":false,"transform":{"type":"scalar"},"locs":[{"a":610,"b":623}]},{"name":"vatNumber","required":false,"transform":{"type":"scalar"},"locs":[{"a":665,"b":674}]},{"name":"addressStreet","required":false,"transform":{"type":"scalar"},"locs":[{"a":724,"b":737}]},{"name":"addressNumber","required":false,"transform":{"type":"scalar"},"locs":[{"a":787,"b":800}]},{"name":"addressZip","required":false,"transform":{"type":"scalar"},"locs":[{"a":844,"b":854}]},{"name":"addressCity","required":false,"transform":{"type":"scalar"},"locs":[{"a":900,"b":911}]},{"name":"addressCountry","required":false,"transform":{"type":"scalar"},"locs":[{"a":963,"b":977}]},{"name":"clientId","required":true,"transform":{"type":"scalar"},"locs":[{"a":991,"b":1000}]}],"statement":"-- Convert an existing stub (claimed_at IS NULL) into a fully activated account.\n-- Used when a user signs up through the public form with an email that already\n-- matches an admin-created stub. The stub's display_name / phone / company info\n-- are preserved if already set; otherwise we apply the new signup values.\nUPDATE client_accounts\nSET password_hash = :passwordHash!,\n    claimed_at = NOW(),\n    display_name = COALESCE(NULLIF(display_name, ''), :displayName!),\n    phone = COALESCE(phone, :phone),\n    company_name = COALESCE(company_name, :companyName),\n    company_number = COALESCE(company_number, :companyNumber),\n    vat_number = COALESCE(vat_number, :vatNumber),\n    address_street = COALESCE(address_street, :addressStreet),\n    address_number = COALESCE(address_number, :addressNumber),\n    address_zip = COALESCE(address_zip, :addressZip),\n    address_city = COALESCE(address_city, :addressCity),\n    address_country = COALESCE(address_country, :addressCountry)\nWHERE id = :clientId!\n  AND claimed_at IS NULL\nRETURNING id, email, display_name"};

/**
 * Query generated from SQL:
 * ```
 * -- Convert an existing stub (claimed_at IS NULL) into a fully activated account.
 * -- Used when a user signs up through the public form with an email that already
 * -- matches an admin-created stub. The stub's display_name / phone / company info
 * -- are preserved if already set; otherwise we apply the new signup values.
 * UPDATE client_accounts
 * SET password_hash = :passwordHash!,
 *     claimed_at = NOW(),
 *     display_name = COALESCE(NULLIF(display_name, ''), :displayName!),
 *     phone = COALESCE(phone, :phone),
 *     company_name = COALESCE(company_name, :companyName),
 *     company_number = COALESCE(company_number, :companyNumber),
 *     vat_number = COALESCE(vat_number, :vatNumber),
 *     address_street = COALESCE(address_street, :addressStreet),
 *     address_number = COALESCE(address_number, :addressNumber),
 *     address_zip = COALESCE(address_zip, :addressZip),
 *     address_city = COALESCE(address_city, :addressCity),
 *     address_country = COALESCE(address_country, :addressCountry)
 * WHERE id = :clientId!
 *   AND claimed_at IS NULL
 * RETURNING id, email, display_name
 * ```
 */
export const claimStubByEmail = new PreparedQuery<IClaimStubByEmailParams,IClaimStubByEmailResult>(claimStubByEmailIR);


