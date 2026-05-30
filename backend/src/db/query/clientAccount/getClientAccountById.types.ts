/** Types generated for queries found in "src/db/query/clientAccount/getClientAccountById.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'GetClientAccountById' parameters type */
export interface IGetClientAccountByIdParams {
  clientId: string;
}

/** 'GetClientAccountById' return type */
export interface IGetClientAccountByIdResult {
  claimed_at: Date | null;
  display_name: string | null;
  email: string | null;
  id: string;
  is_active: boolean;
}

/** 'GetClientAccountById' query type */
export interface IGetClientAccountByIdQuery {
  params: IGetClientAccountByIdParams;
  result: IGetClientAccountByIdResult;
}

const getClientAccountByIdIR: any = {"usedParamSet":{"clientId":true},"params":[{"name":"clientId","required":true,"transform":{"type":"scalar"},"locs":[{"a":86,"b":95}]}],"statement":"SELECT id, email, display_name, is_active, claimed_at\nFROM client_accounts\nWHERE id = :clientId!\nLIMIT 1"};

/**
 * Query generated from SQL:
 * ```
 * SELECT id, email, display_name, is_active, claimed_at
 * FROM client_accounts
 * WHERE id = :clientId!
 * LIMIT 1
 * ```
 */
export const getClientAccountById = new PreparedQuery<IGetClientAccountByIdParams,IGetClientAccountByIdResult>(getClientAccountByIdIR);


