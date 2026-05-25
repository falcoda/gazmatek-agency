/** Types generated for queries found in "src/db/query/auth/createUser.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'CreateUser' parameters type */
export interface ICreateUserParams {
  email: string;
  passwordHash: string;
}

/** 'CreateUser' return type */
export interface ICreateUserResult {
  created_at: Date;
  email: string;
  user_id: string;
}

/** 'CreateUser' query type */
export interface ICreateUserQuery {
  params: ICreateUserParams;
  result: ICreateUserResult;
}

const createUserIR: any = {"usedParamSet":{"email":true,"passwordHash":true},"params":[{"name":"email","required":true,"transform":{"type":"scalar"},"locs":[{"a":91,"b":97}]},{"name":"passwordHash","required":true,"transform":{"type":"scalar"},"locs":[{"a":100,"b":113}]}],"statement":"-- Create a new user with hashed password\nINSERT INTO users (email, password_hash)\nVALUES (:email!, :passwordHash!)\nRETURNING user_id, email, created_at"};

/**
 * Query generated from SQL:
 * ```
 * -- Create a new user with hashed password
 * INSERT INTO users (email, password_hash)
 * VALUES (:email!, :passwordHash!)
 * RETURNING user_id, email, created_at
 * ```
 */
export const createUser = new PreparedQuery<ICreateUserParams,ICreateUserResult>(createUserIR);


