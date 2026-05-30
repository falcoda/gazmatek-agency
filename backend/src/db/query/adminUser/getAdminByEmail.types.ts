/** Types generated for queries found in "src/db/query/adminUser/getAdminByEmail.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'GetAdminByEmail' parameters type */
export interface IGetAdminByEmailParams {
  email: string;
}

/** 'GetAdminByEmail' return type */
export interface IGetAdminByEmailResult {
  email: string;
  failed_login_attempts: number;
  full_name: string;
  id: string;
  is_active: boolean;
  locked_until: Date | null;
  password_hash: string;
}

/** 'GetAdminByEmail' query type */
export interface IGetAdminByEmailQuery {
  params: IGetAdminByEmailParams;
  result: IGetAdminByEmailResult;
}

const getAdminByEmailIR: any = {"usedParamSet":{"email":true},"params":[{"name":"email","required":true,"transform":{"type":"scalar"},"locs":[{"a":129,"b":135}]}],"statement":"SELECT id, email, password_hash, full_name, is_active,\n       failed_login_attempts, locked_until\nFROM admin_users\nWHERE email = :email!\nLIMIT 1"};

/**
 * Query generated from SQL:
 * ```
 * SELECT id, email, password_hash, full_name, is_active,
 *        failed_login_attempts, locked_until
 * FROM admin_users
 * WHERE email = :email!
 * LIMIT 1
 * ```
 */
export const getAdminByEmail = new PreparedQuery<IGetAdminByEmailParams,IGetAdminByEmailResult>(getAdminByEmailIR);


