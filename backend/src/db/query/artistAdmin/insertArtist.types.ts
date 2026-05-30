/** Types generated for queries found in "src/db/query/artistAdmin/insertArtist.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'InsertArtist' parameters type */
export interface IInsertArtistParams {
  bioEn?: string | null | void;
  bioFr?: string | null | void;
  bioNl?: string | null | void;
  coverImageUrl?: string | null | void;
  genre?: string | null | void;
  isFeatured: boolean;
  isPublished: boolean;
  slug: string;
  stageName: string;
}

/** 'InsertArtist' return type */
export interface IInsertArtistResult {
  created_at: Date;
  id: string;
  is_published: boolean;
  slug: string;
  stage_name: string;
}

/** 'InsertArtist' query type */
export interface IInsertArtistQuery {
  params: IInsertArtistParams;
  result: IInsertArtistResult;
}

const insertArtistIR: any = {"usedParamSet":{"slug":true,"stageName":true,"bioFr":true,"bioNl":true,"bioEn":true,"genre":true,"isPublished":true,"isFeatured":true,"coverImageUrl":true},"params":[{"name":"slug","required":true,"transform":{"type":"scalar"},"locs":[{"a":131,"b":136}]},{"name":"stageName","required":true,"transform":{"type":"scalar"},"locs":[{"a":139,"b":149}]},{"name":"bioFr","required":false,"transform":{"type":"scalar"},"locs":[{"a":152,"b":157}]},{"name":"bioNl","required":false,"transform":{"type":"scalar"},"locs":[{"a":160,"b":165}]},{"name":"bioEn","required":false,"transform":{"type":"scalar"},"locs":[{"a":168,"b":173}]},{"name":"genre","required":false,"transform":{"type":"scalar"},"locs":[{"a":178,"b":183}]},{"name":"isPublished","required":true,"transform":{"type":"scalar"},"locs":[{"a":186,"b":198}]},{"name":"isFeatured","required":true,"transform":{"type":"scalar"},"locs":[{"a":201,"b":212}]},{"name":"coverImageUrl","required":false,"transform":{"type":"scalar"},"locs":[{"a":215,"b":228}]}],"statement":"INSERT INTO artists (\n  slug, stage_name, bio_fr, bio_nl, bio_en,\n  genre, is_published, is_featured, cover_image_url\n)\nVALUES (\n  :slug!, :stageName!, :bioFr, :bioNl, :bioEn,\n  :genre, :isPublished!, :isFeatured!, :coverImageUrl\n)\nRETURNING id, slug, stage_name, is_published, created_at"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO artists (
 *   slug, stage_name, bio_fr, bio_nl, bio_en,
 *   genre, is_published, is_featured, cover_image_url
 * )
 * VALUES (
 *   :slug!, :stageName!, :bioFr, :bioNl, :bioEn,
 *   :genre, :isPublished!, :isFeatured!, :coverImageUrl
 * )
 * RETURNING id, slug, stage_name, is_published, created_at
 * ```
 */
export const insertArtist = new PreparedQuery<IInsertArtistParams,IInsertArtistResult>(insertArtistIR);


