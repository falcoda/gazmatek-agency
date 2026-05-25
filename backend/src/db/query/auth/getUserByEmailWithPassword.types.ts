/** Types generated for queries found in "src/db/query/auth/getUserByEmailWithPassword.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'GetUserByEmailWithPassword' parameters type */
export interface IGetUserByEmailWithPasswordParams {
  email: string;
}

/** 'GetUserByEmailWithPassword' return type */
export interface IGetUserByEmailWithPasswordResult {
  email: string;
  password_hash: string | null;
  user_id: string;
}

/** 'GetUserByEmailWithPassword' query type */
export interface IGetUserByEmailWithPasswordQuery {
  params: IGetUserByEmailWithPasswordParams;
  result: IGetUserByEmailWithPasswordResult;
}

const getUserByEmailWithPasswordIR: any = {"usedParamSet":{"email":true},"params":[{"name":"email","required":true,"transform":{"type":"scalar"},"locs":[{"a":129,"b":135}]}],"statement":"-- Get user by email including password hash (for login)\nSELECT u.user_id, u.email, u.password_hash\nFROM users u\nWHERE u.email = :email!"};

/**
 * Query generated from SQL:
 * ```
 * -- Get user by email including password hash (for login)
 * SELECT u.user_id, u.email, u.password_hash
 * FROM users u
 * WHERE u.email = :email!
 * ```
 */
export const getUserByEmailWithPassword = new PreparedQuery<IGetUserByEmailWithPasswordParams,IGetUserByEmailWithPasswordResult>(getUserByEmailWithPasswordIR);


