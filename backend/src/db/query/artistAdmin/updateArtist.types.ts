/** Types generated for queries found in "src/db/query/artistAdmin/updateArtist.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type artist_level = 'L1' | 'L2' | 'L3' | 'L4';

/** 'UpdateArtist' parameters type */
export interface IUpdateArtistParams {
  artistId: string;
  bioEn?: string | null | void;
  bioFr?: string | null | void;
  bioNl?: string | null | void;
  coverImageUrl?: string | null | void;
  genre?: string | null | void;
  isFeatured?: boolean | null | void;
  isPublished?: boolean | null | void;
  level?: artist_level | null | void;
  slug?: string | null | void;
  stageName?: string | null | void;
}

/** 'UpdateArtist' return type */
export interface IUpdateArtistResult {
  id: string;
  is_published: boolean;
  slug: string;
  stage_name: string;
  updated_at: Date;
}

/** 'UpdateArtist' query type */
export interface IUpdateArtistQuery {
  params: IUpdateArtistParams;
  result: IUpdateArtistResult;
}

const updateArtistIR: any = {"usedParamSet":{"slug":true,"stageName":true,"bioFr":true,"bioNl":true,"bioEn":true,"genre":true,"isPublished":true,"isFeatured":true,"coverImageUrl":true,"level":true,"artistId":true},"params":[{"name":"slug","required":false,"transform":{"type":"scalar"},"locs":[{"a":35,"b":39}]},{"name":"stageName","required":false,"transform":{"type":"scalar"},"locs":[{"a":75,"b":84}]},{"name":"bioFr","required":false,"transform":{"type":"scalar"},"locs":[{"a":122,"b":127}]},{"name":"bioNl","required":false,"transform":{"type":"scalar"},"locs":[{"a":161,"b":166}]},{"name":"bioEn","required":false,"transform":{"type":"scalar"},"locs":[{"a":200,"b":205}]},{"name":"genre","required":false,"transform":{"type":"scalar"},"locs":[{"a":238,"b":243}]},{"name":"isPublished","required":false,"transform":{"type":"scalar"},"locs":[{"a":282,"b":293}]},{"name":"isFeatured","required":false,"transform":{"type":"scalar"},"locs":[{"a":338,"b":348}]},{"name":"coverImageUrl","required":false,"transform":{"type":"scalar"},"locs":[{"a":396,"b":409}]},{"name":"level","required":false,"transform":{"type":"scalar"},"locs":[{"a":451,"b":456}]},{"name":"artistId","required":true,"transform":{"type":"scalar"},"locs":[{"a":515,"b":524}]}],"statement":"UPDATE artists\nSET slug = COALESCE(:slug, slug),\n    stage_name = COALESCE(:stageName, stage_name),\n    bio_fr = COALESCE(:bioFr, bio_fr),\n    bio_nl = COALESCE(:bioNl, bio_nl),\n    bio_en = COALESCE(:bioEn, bio_en),\n    genre = COALESCE(:genre, genre),\n    is_published = COALESCE(:isPublished, is_published),\n    is_featured = COALESCE(:isFeatured, is_featured),\n    cover_image_url = COALESCE(:coverImageUrl, cover_image_url),\n    level = COALESCE(:level::artist_level, level),\n    updated_at = NOW()\nWHERE id = :artistId!\nRETURNING id, slug, stage_name, is_published, updated_at"};

/**
 * Query generated from SQL:
 * ```
 * UPDATE artists
 * SET slug = COALESCE(:slug, slug),
 *     stage_name = COALESCE(:stageName, stage_name),
 *     bio_fr = COALESCE(:bioFr, bio_fr),
 *     bio_nl = COALESCE(:bioNl, bio_nl),
 *     bio_en = COALESCE(:bioEn, bio_en),
 *     genre = COALESCE(:genre, genre),
 *     is_published = COALESCE(:isPublished, is_published),
 *     is_featured = COALESCE(:isFeatured, is_featured),
 *     cover_image_url = COALESCE(:coverImageUrl, cover_image_url),
 *     level = COALESCE(:level::artist_level, level),
 *     updated_at = NOW()
 * WHERE id = :artistId!
 * RETURNING id, slug, stage_name, is_published, updated_at
 * ```
 */
export const updateArtist = new PreparedQuery<IUpdateArtistParams,IUpdateArtistResult>(updateArtistIR);


