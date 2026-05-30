/** Types generated for queries found in "src/db/query/agencySettings/getAgencySettings.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'GetAgencySettings' parameters type */
export type IGetAgencySettingsParams = void;

/** 'GetAgencySettings' return type */
export interface IGetAgencySettingsResult {
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

/** 'GetAgencySettings' query type */
export interface IGetAgencySettingsQuery {
  params: IGetAgencySettingsParams;
  result: IGetAgencySettingsResult;
}

const getAgencySettingsIR: any = {"usedParamSet":{},"params":[],"statement":"SELECT signature_image_path,\n       name,\n       representative,\n       address,\n       city,\n       company_number,\n       vat_number,\n       email,\n       iban\nFROM agency_settings\nWHERE id = TRUE"};

/**
 * Query generated from SQL:
 * ```
 * SELECT signature_image_path,
 *        name,
 *        representative,
 *        address,
 *        city,
 *        company_number,
 *        vat_number,
 *        email,
 *        iban
 * FROM agency_settings
 * WHERE id = TRUE
 * ```
 */
export const getAgencySettings = new PreparedQuery<IGetAgencySettingsParams,IGetAgencySettingsResult>(getAgencySettingsIR);


