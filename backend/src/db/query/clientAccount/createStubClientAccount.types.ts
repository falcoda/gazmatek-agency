/** Types generated for queries found in "src/db/query/clientAccount/createStubClientAccount.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'CreateStubClientAccount' parameters type */
export interface ICreateStubClientAccountParams {
  addressCity?: string | null | void;
  addressCountry?: string | null | void;
  addressNumber?: string | null | void;
  addressStreet?: string | null | void;
  addressZip?: string | null | void;
  companyName?: string | null | void;
  companyNumber?: string | null | void;
  displayName: string;
  email?: string | null | void;
  phone?: string | null | void;
  vatNumber?: string | null | void;
}

/** 'CreateStubClientAccount' return type */
export interface ICreateStubClientAccountResult {
  display_name: string | null;
  email: string | null;
  id: string;
}

/** 'CreateStubClientAccount' query type */
export interface ICreateStubClientAccountQuery {
  params: ICreateStubClientAccountParams;
  result: ICreateStubClientAccountResult;
}

const createStubClientAccountIR: any = {"usedParamSet":{"email":true,"displayName":true,"phone":true,"companyName":true,"companyNumber":true,"vatNumber":true,"addressStreet":true,"addressNumber":true,"addressZip":true,"addressCity":true,"addressCountry":true},"params":[{"name":"email","required":false,"transform":{"type":"scalar"},"locs":[{"a":510,"b":515}]},{"name":"displayName","required":true,"transform":{"type":"scalar"},"locs":[{"a":518,"b":530}]},{"name":"phone","required":false,"transform":{"type":"scalar"},"locs":[{"a":535,"b":540}]},{"name":"companyName","required":false,"transform":{"type":"scalar"},"locs":[{"a":545,"b":556}]},{"name":"companyNumber","required":false,"transform":{"type":"scalar"},"locs":[{"a":559,"b":572}]},{"name":"vatNumber","required":false,"transform":{"type":"scalar"},"locs":[{"a":575,"b":584}]},{"name":"addressStreet","required":false,"transform":{"type":"scalar"},"locs":[{"a":589,"b":602}]},{"name":"addressNumber","required":false,"transform":{"type":"scalar"},"locs":[{"a":605,"b":618}]},{"name":"addressZip","required":false,"transform":{"type":"scalar"},"locs":[{"a":621,"b":631}]},{"name":"addressCity","required":false,"transform":{"type":"scalar"},"locs":[{"a":634,"b":645}]},{"name":"addressCountry","required":false,"transform":{"type":"scalar"},"locs":[{"a":648,"b":662}]}],"statement":"-- Creates an \"unclaimed\" client account on behalf of an admin-created booking.\n-- The email column is nullable so the admin can create the stub before knowing\n-- the client's email. claimed_at stays NULL until the client sets a password\n-- through the invitation/reset-password flow.\nINSERT INTO client_accounts (\n  email, display_name,\n  phone,\n  company_name, company_number, vat_number,\n  address_street, address_number, address_zip, address_city, address_country,\n  claimed_at, password_hash\n)\nVALUES (\n  :email, :displayName!,\n  :phone,\n  :companyName, :companyNumber, :vatNumber,\n  :addressStreet, :addressNumber, :addressZip, :addressCity, :addressCountry,\n  NULL, NULL\n)\nRETURNING id, email, display_name"};

/**
 * Query generated from SQL:
 * ```
 * -- Creates an "unclaimed" client account on behalf of an admin-created booking.
 * -- The email column is nullable so the admin can create the stub before knowing
 * -- the client's email. claimed_at stays NULL until the client sets a password
 * -- through the invitation/reset-password flow.
 * INSERT INTO client_accounts (
 *   email, display_name,
 *   phone,
 *   company_name, company_number, vat_number,
 *   address_street, address_number, address_zip, address_city, address_country,
 *   claimed_at, password_hash
 * )
 * VALUES (
 *   :email, :displayName!,
 *   :phone,
 *   :companyName, :companyNumber, :vatNumber,
 *   :addressStreet, :addressNumber, :addressZip, :addressCity, :addressCountry,
 *   NULL, NULL
 * )
 * RETURNING id, email, display_name
 * ```
 */
export const createStubClientAccount = new PreparedQuery<ICreateStubClientAccountParams,ICreateStubClientAccountResult>(createStubClientAccountIR);


