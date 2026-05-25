/** Types generated for queries found in "src/db/query/auth/getUserByApiKey.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'GetUserByApiKey' parameters type */
export interface IGetUserByApiKeyParams {
  apiKey: string;
}

/** 'GetUserByApiKey' return type */
export interface IGetUserByApiKeyResult {
  email: string;
  user_id: string;
}

/** 'GetUserByApiKey' query type */
export interface IGetUserByApiKeyQuery {
  params: IGetUserByApiKeyParams;
  result: IGetUserByApiKeyResult;
}

const getUserByApiKeyIR: any = {"usedParamSet":{"apiKey":true},"params":[{"name":"apiKey","required":true,"transform":{"type":"scalar"},"locs":[{"a":136,"b":143}]}],"statement":"-- Get active user by API key\nSELECT u.user_id, u.email\nFROM user_api_keys ak\nJOIN users u ON u.user_id = ak.user_id\nWHERE ak.api_key = :apiKey!\n  AND ak.is_active = TRUE"};

/**
 * Query generated from SQL:
 * ```
 * -- Get active user by API key
 * SELECT u.user_id, u.email
 * FROM user_api_keys ak
 * JOIN users u ON u.user_id = ak.user_id
 * WHERE ak.api_key = :apiKey!
 *   AND ak.is_active = TRUE
 * ```
 */
export const getUserByApiKey = new PreparedQuery<IGetUserByApiKeyParams,IGetUserByApiKeyResult>(getUserByApiKeyIR);


