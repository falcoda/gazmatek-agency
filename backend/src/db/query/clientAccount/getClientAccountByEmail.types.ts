/** Types generated for queries found in "src/db/query/clientAccount/getClientAccountByEmail.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'GetClientAccountByEmail' parameters type */
export interface IGetClientAccountByEmailParams {
  email: string;
}

/** 'GetClientAccountByEmail' return type */
export interface IGetClientAccountByEmailResult {
  claimed_at: Date | null;
  display_name: string | null;
  email: string | null;
  failed_login_attempts: number;
  id: string;
  is_active: boolean;
  locked_until: Date | null;
  password_hash: string | null;
}

/** 'GetClientAccountByEmail' query type */
export interface IGetClientAccountByEmailQuery {
  params: IGetClientAccountByEmailParams;
  result: IGetClientAccountByEmailResult;
}

const getClientAccountByEmailIR: any = {"usedParamSet":{"email":true},"params":[{"name":"email","required":true,"transform":{"type":"scalar"},"locs":[{"a":155,"b":161}]}],"statement":"SELECT id, email, password_hash, display_name,\n       claimed_at,\n       failed_login_attempts, locked_until, is_active\nFROM client_accounts\nWHERE email = :email!\nLIMIT 1"};

/**
 * Query generated from SQL:
 * ```
 * SELECT id, email, password_hash, display_name,
 *        claimed_at,
 *        failed_login_attempts, locked_until, is_active
 * FROM client_accounts
 * WHERE email = :email!
 * LIMIT 1
 * ```
 */
export const getClientAccountByEmail = new PreparedQuery<IGetClientAccountByEmailParams,IGetClientAccountByEmailResult>(getClientAccountByEmailIR);


