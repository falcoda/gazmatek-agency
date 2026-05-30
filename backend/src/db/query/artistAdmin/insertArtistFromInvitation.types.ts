/** Types generated for queries found in "src/db/query/artistAdmin/insertArtistFromInvitation.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type artist_level = 'L1' | 'L2' | 'L3' | 'L4';

export type artist_set_type = 'dj' | 'hybrid' | 'live';

/** 'InsertArtistFromInvitation' parameters type */
export interface IInsertArtistFromInvitationParams {
  level: artist_level;
  setType: artist_set_type;
  slug: string;
  stageName: string;
}

/** 'InsertArtistFromInvitation' return type */
export interface IInsertArtistFromInvitationResult {
  id: string;
  slug: string;
  stage_name: string;
}

/** 'InsertArtistFromInvitation' query type */
export interface IInsertArtistFromInvitationQuery {
  params: IInsertArtistFromInvitationParams;
  result: IInsertArtistFromInvitationResult;
}

const insertArtistFromInvitationIR: any = {"usedParamSet":{"slug":true,"stageName":true,"level":true,"setType":true},"params":[{"name":"slug","required":true,"transform":{"type":"scalar"},"locs":[{"a":334,"b":339}]},{"name":"stageName","required":true,"transform":{"type":"scalar"},"locs":[{"a":342,"b":352}]},{"name":"level","required":true,"transform":{"type":"scalar"},"locs":[{"a":357,"b":363}]},{"name":"setType","required":true,"transform":{"type":"scalar"},"locs":[{"a":374,"b":382}]}],"statement":"-- Inserts a minimal artist row on invitation acceptance. The admin still has\n-- to fill bio/photos from the back-office — this is intentionally the\n-- smallest viable artist so the magic-link flow can finish in one click.\nINSERT INTO artists (\n  slug, stage_name,\n  level, supported_set_types, is_published, is_featured\n)\nVALUES (\n  :slug!, :stageName!,\n  :level!,\n  ARRAY[:setType!::artist_set_type],\n  FALSE, FALSE\n)\nRETURNING id, slug, stage_name"};

/**
 * Query generated from SQL:
 * ```
 * -- Inserts a minimal artist row on invitation acceptance. The admin still has
 * -- to fill bio/photos from the back-office — this is intentionally the
 * -- smallest viable artist so the magic-link flow can finish in one click.
 * INSERT INTO artists (
 *   slug, stage_name,
 *   level, supported_set_types, is_published, is_featured
 * )
 * VALUES (
 *   :slug!, :stageName!,
 *   :level!,
 *   ARRAY[:setType!::artist_set_type],
 *   FALSE, FALSE
 * )
 * RETURNING id, slug, stage_name
 * ```
 */
export const insertArtistFromInvitation = new PreparedQuery<IInsertArtistFromInvitationParams,IInsertArtistFromInvitationResult>(insertArtistFromInvitationIR);


