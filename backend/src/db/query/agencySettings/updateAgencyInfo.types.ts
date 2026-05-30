/** Types generated for queries found in "src/db/query/agencySettings/updateAgencyInfo.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'UpdateAgencyInfo' parameters type */
export interface IUpdateAgencyInfoParams {
  address?: string | null | void;
  city?: string | null | void;
  companyNumber?: string | null | void;
  email?: string | null | void;
  iban?: string | null | void;
  name?: string | null | void;
  representative?: string | null | void;
  vatNumber?: string | null | void;
}

/** 'UpdateAgencyInfo' return type */
export interface IUpdateAgencyInfoResult {
  address: string | null;
  city: string | null;
  company_number: string | null;
  email: string | null;
  iban: string | null;
  name: string | null;
  representative: string | null;
  signature_image_path: string | null;
  vat_number: string | null;
}

/** 'UpdateAgencyInfo' query type */
export interface IUpdateAgencyInfoQuery {
  params: IUpdateAgencyInfoParams;
  result: IUpdateAgencyInfoResult;
}

const updateAgencyInfoIR: any = {"usedParamSet":{"name":true,"representative":true,"address":true,"city":true,"companyNumber":true,"vatNumber":true,"email":true,"iban":true},"params":[{"name":"name","required":false,"transform":{"type":"scalar"},"locs":[{"a":34,"b":38}]},{"name":"representative","required":false,"transform":{"type":"scalar"},"locs":[{"a":62,"b":76}]},{"name":"address","required":false,"transform":{"type":"scalar"},"locs":[{"a":93,"b":100}]},{"name":"city","required":false,"transform":{"type":"scalar"},"locs":[{"a":114,"b":118}]},{"name":"companyNumber","required":false,"transform":{"type":"scalar"},"locs":[{"a":142,"b":155}]},{"name":"vatNumber","required":false,"transform":{"type":"scalar"},"locs":[{"a":175,"b":184}]},{"name":"email","required":false,"transform":{"type":"scalar"},"locs":[{"a":199,"b":204}]},{"name":"iban","required":false,"transform":{"type":"scalar"},"locs":[{"a":218,"b":222}]}],"statement":"UPDATE agency_settings\nSET name = :name,\n    representative = :representative,\n    address = :address,\n    city = :city,\n    company_number = :companyNumber,\n    vat_number = :vatNumber,\n    email = :email,\n    iban = :iban,\n    updated_at = NOW()\nWHERE id = TRUE\nRETURNING signature_image_path,\n          name,\n          representative,\n          address,\n          city,\n          company_number,\n          vat_number,\n          email,\n          iban"};

/**
 * Query generated from SQL:
 * ```
 * UPDATE agency_settings
 * SET name = :name,
 *     representative = :representative,
 *     address = :address,
 *     city = :city,
 *     company_number = :companyNumber,
 *     vat_number = :vatNumber,
 *     email = :email,
 *     iban = :iban,
 *     updated_at = NOW()
 * WHERE id = TRUE
 * RETURNING signature_image_path,
 *           name,
 *           representative,
 *           address,
 *           city,
 *           company_number,
 *           vat_number,
 *           email,
 *           iban
 * ```
 */
export const updateAgencyInfo = new PreparedQuery<IUpdateAgencyInfoParams,IUpdateAgencyInfoResult>(updateAgencyInfoIR);


