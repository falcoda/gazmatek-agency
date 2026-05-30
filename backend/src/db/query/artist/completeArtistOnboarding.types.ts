/** Types generated for queries found in "src/db/query/artist/completeArtistOnboarding.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'CompleteArtistOnboarding' parameters type */
export interface ICompleteArtistOnboardingParams {
  artistId: string;
}

/** 'CompleteArtistOnboarding' return type */
export interface ICompleteArtistOnboardingResult {
  id: string;
  onboarding_completed_at: Date | null;
}

/** 'CompleteArtistOnboarding' query type */
export interface ICompleteArtistOnboardingQuery {
  params: ICompleteArtistOnboardingParams;
  result: ICompleteArtistOnboardingResult;
}

const completeArtistOnboardingIR: any = {"usedParamSet":{"artistId":true},"params":[{"name":"artistId","required":true,"transform":{"type":"scalar"},"locs":[{"a":86,"b":95}]}],"statement":"UPDATE artists\nSET onboarding_completed_at = NOW(),\n    updated_at = NOW()\nWHERE id = :artistId!\n  AND onboarding_completed_at IS NULL\nRETURNING id, onboarding_completed_at"};

/**
 * Query generated from SQL:
 * ```
 * UPDATE artists
 * SET onboarding_completed_at = NOW(),
 *     updated_at = NOW()
 * WHERE id = :artistId!
 *   AND onboarding_completed_at IS NULL
 * RETURNING id, onboarding_completed_at
 * ```
 */
export const completeArtistOnboarding = new PreparedQuery<ICompleteArtistOnboardingParams,ICompleteArtistOnboardingResult>(completeArtistOnboardingIR);


