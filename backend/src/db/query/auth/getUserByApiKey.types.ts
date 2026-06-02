/** Types generated for queries found in "src/db/query/auth/getUserByApiKey.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'GetUserByApiKey' parameters type */
export interface IGetUserByApiKeyParams {
  apiKeyHash: string;
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

const getUserByApiKeyIR: any = {"usedParamSet":{"apiKeyHash":true},"params":[{"name":"apiKeyHash","required":true,"transform":{"type":"scalar"},"locs":[{"a":262,"b":273}]}],"statement":"-- Get active user by API key. `:apiKeyHash` is the SHA-256 hex digest of the\n-- presented key (#15) — the column stores the hash, never the plaintext key.\nSELECT u.user_id, u.email\nFROM user_api_keys ak\nJOIN users u ON u.user_id = ak.user_id\nWHERE ak.api_key = :apiKeyHash!\n  AND ak.is_active = TRUE"};

/**
 * Query generated from SQL:
 * ```
 * -- Get active user by API key. `:apiKeyHash` is the SHA-256 hex digest of the
 * -- presented key (#15) — the column stores the hash, never the plaintext key.
 * SELECT u.user_id, u.email
 * FROM user_api_keys ak
 * JOIN users u ON u.user_id = ak.user_id
 * WHERE ak.api_key = :apiKeyHash!
 *   AND ak.is_active = TRUE
 * ```
 */
export const getUserByApiKey = new PreparedQuery<IGetUserByApiKeyParams,IGetUserByApiKeyResult>(getUserByApiKeyIR);


