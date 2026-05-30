/** Types generated for queries found in "src/db/query/clientAccount/createClientAccount.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'CreateClientAccount' parameters type */
export interface ICreateClientAccountParams {
  addressCity?: string | null | void;
  addressCountry?: string | null | void;
  addressNumber?: string | null | void;
  addressStreet?: string | null | void;
  addressZip?: string | null | void;
  companyName?: string | null | void;
  companyNumber?: string | null | void;
  displayName?: string | null | void;
  email: string;
  passwordHash: string;
  phone?: string | null | void;
  vatNumber?: string | null | void;
}

/** 'CreateClientAccount' return type */
export interface ICreateClientAccountResult {
  display_name: string | null;
  email: string | null;
  id: string;
}

/** 'CreateClientAccount' query type */
export interface ICreateClientAccountQuery {
  params: ICreateClientAccountParams;
  result: ICreateClientAccountResult;
}

const createClientAccountIR: any = {"usedParamSet":{"email":true,"passwordHash":true,"displayName":true,"phone":true,"companyName":true,"companyNumber":true,"vatNumber":true,"addressStreet":true,"addressNumber":true,"addressZip":true,"addressCity":true,"addressCountry":true},"params":[{"name":"email","required":true,"transform":{"type":"scalar"},"locs":[{"a":211,"b":217}]},{"name":"passwordHash","required":true,"transform":{"type":"scalar"},"locs":[{"a":220,"b":233}]},{"name":"displayName","required":false,"transform":{"type":"scalar"},"locs":[{"a":236,"b":247}]},{"name":"phone","required":false,"transform":{"type":"scalar"},"locs":[{"a":252,"b":257}]},{"name":"companyName","required":false,"transform":{"type":"scalar"},"locs":[{"a":262,"b":273}]},{"name":"companyNumber","required":false,"transform":{"type":"scalar"},"locs":[{"a":276,"b":289}]},{"name":"vatNumber","required":false,"transform":{"type":"scalar"},"locs":[{"a":292,"b":301}]},{"name":"addressStreet","required":false,"transform":{"type":"scalar"},"locs":[{"a":306,"b":319}]},{"name":"addressNumber","required":false,"transform":{"type":"scalar"},"locs":[{"a":322,"b":335}]},{"name":"addressZip","required":false,"transform":{"type":"scalar"},"locs":[{"a":338,"b":348}]},{"name":"addressCity","required":false,"transform":{"type":"scalar"},"locs":[{"a":351,"b":362}]},{"name":"addressCountry","required":false,"transform":{"type":"scalar"},"locs":[{"a":365,"b":379}]}],"statement":"INSERT INTO client_accounts (\n  email, password_hash, display_name,\n  phone,\n  company_name, company_number, vat_number,\n  address_street, address_number, address_zip, address_city, address_country\n)\nVALUES (\n  :email!, :passwordHash!, :displayName,\n  :phone,\n  :companyName, :companyNumber, :vatNumber,\n  :addressStreet, :addressNumber, :addressZip, :addressCity, :addressCountry\n)\nRETURNING id, email, display_name"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO client_accounts (
 *   email, password_hash, display_name,
 *   phone,
 *   company_name, company_number, vat_number,
 *   address_street, address_number, address_zip, address_city, address_country
 * )
 * VALUES (
 *   :email!, :passwordHash!, :displayName,
 *   :phone,
 *   :companyName, :companyNumber, :vatNumber,
 *   :addressStreet, :addressNumber, :addressZip, :addressCity, :addressCountry
 * )
 * RETURNING id, email, display_name
 * ```
 */
export const createClientAccount = new PreparedQuery<ICreateClientAccountParams,ICreateClientAccountResult>(createClientAccountIR);


