/** Types generated for queries found in "src/db/query/auth/getUserByEmail.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'GetUserByEmail' parameters type */
export interface IGetUserByEmailParams {
  email: string;
}

/** 'GetUserByEmail' return type */
export interface IGetUserByEmailResult {
  email: string;
  user_id: string;
}

/** 'GetUserByEmail' query type */
export interface IGetUserByEmailQuery {
  params: IGetUserByEmailParams;
  result: IGetUserByEmailResult;
}

const getUserByEmailIR: any = {"usedParamSet":{"email":true},"params":[{"name":"email","required":true,"transform":{"type":"scalar"},"locs":[{"a":76,"b":82}]}],"statement":"-- Get user by email\nSELECT u.user_id, u.email\nFROM users u\nWHERE u.email = :email!"};

/**
 * Query generated from SQL:
 * ```
 * -- Get user by email
 * SELECT u.user_id, u.email
 * FROM users u
 * WHERE u.email = :email!
 * ```
 */
export const getUserByEmail = new PreparedQuery<IGetUserByEmailParams,IGetUserByEmailResult>(getUserByEmailIR);


