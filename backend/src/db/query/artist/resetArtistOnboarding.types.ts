/** Types generated for queries found in "src/db/query/artist/resetArtistOnboarding.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'ResetArtistOnboarding' parameters type */
export interface IResetArtistOnboardingParams {
  artistId: string;
}

/** 'ResetArtistOnboarding' return type */
export interface IResetArtistOnboardingResult {
  id: string;
}

/** 'ResetArtistOnboarding' query type */
export interface IResetArtistOnboardingQuery {
  params: IResetArtistOnboardingParams;
  result: IResetArtistOnboardingResult;
}

const resetArtistOnboardingIR: any = {"usedParamSet":{"artistId":true},"params":[{"name":"artistId","required":true,"transform":{"type":"scalar"},"locs":[{"a":120,"b":129}]}],"statement":"UPDATE artists\nSET engagement_contract_id = NULL,\n    onboarding_completed_at = NULL,\n    updated_at = NOW()\nWHERE id = :artistId!\nRETURNING id"};

/**
 * Query generated from SQL:
 * ```
 * UPDATE artists
 * SET engagement_contract_id = NULL,
 *     onboarding_completed_at = NULL,
 *     updated_at = NOW()
 * WHERE id = :artistId!
 * RETURNING id
 * ```
 */
export const resetArtistOnboarding = new PreparedQuery<IResetArtistOnboardingParams,IResetArtistOnboardingResult>(resetArtistOnboardingIR);


