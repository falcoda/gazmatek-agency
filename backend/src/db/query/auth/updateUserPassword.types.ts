/** Types generated for queries found in "src/db/query/auth/updateUserPassword.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type NumberOrString = number | string;

/** 'UpdateUserPassword' parameters type */
export interface IUpdateUserPasswordParams {
  passwordHash: string;
  userId: NumberOrString;
}

/** 'UpdateUserPassword' return type */
export interface IUpdateUserPasswordResult {
  user_id: string;
}

/** 'UpdateUserPassword' query type */
export interface IUpdateUserPasswordQuery {
  params: IUpdateUserPasswordParams;
  result: IUpdateUserPasswordResult;
}

const updateUserPasswordIR: any = {"usedParamSet":{"passwordHash":true,"userId":true},"params":[{"name":"passwordHash","required":true,"transform":{"type":"scalar"},"locs":[{"a":33,"b":46}]},{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":88,"b":95}]}],"statement":"UPDATE users\nSET password_hash = :passwordHash!,\n    updated_at = NOW()\nWHERE user_id = :userId!\nRETURNING user_id"};

/**
 * Query generated from SQL:
 * ```
 * UPDATE users
 * SET password_hash = :passwordHash!,
 *     updated_at = NOW()
 * WHERE user_id = :userId!
 * RETURNING user_id
 * ```
 */
export const updateUserPassword = new PreparedQuery<IUpdateUserPasswordParams,IUpdateUserPasswordResult>(updateUserPasswordIR);


