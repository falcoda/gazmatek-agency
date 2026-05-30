/** Types generated for queries found in "src/db/query/artist/listArtistPhotos.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'ListArtistPhotos' parameters type */
export interface IListArtistPhotosParams {
  artistId: string;
}

/** 'ListArtistPhotos' return type */
export interface IListArtistPhotosResult {
  alt_en: string | null;
  alt_fr: string | null;
  alt_nl: string | null;
  artist_id: string;
  id: string;
  position: number;
  url: string;
}

/** 'ListArtistPhotos' query type */
export interface IListArtistPhotosQuery {
  params: IListArtistPhotosParams;
  result: IListArtistPhotosResult;
}

const listArtistPhotosIR: any = {"usedParamSet":{"artistId":true},"params":[{"name":"artistId","required":true,"transform":{"type":"scalar"},"locs":[{"a":170,"b":179}]}],"statement":"-- Photos for a given artist, ordered by display position.\nSELECT\n  id,\n  artist_id,\n  url,\n  alt_fr,\n  alt_nl,\n  alt_en,\n  position\nFROM artist_photos\nWHERE artist_id = :artistId!\nORDER BY position ASC, created_at ASC"};

/**
 * Query generated from SQL:
 * ```
 * -- Photos for a given artist, ordered by display position.
 * SELECT
 *   id,
 *   artist_id,
 *   url,
 *   alt_fr,
 *   alt_nl,
 *   alt_en,
 *   position
 * FROM artist_photos
 * WHERE artist_id = :artistId!
 * ORDER BY position ASC, created_at ASC
 * ```
 */
export const listArtistPhotos = new PreparedQuery<IListArtistPhotosParams,IListArtistPhotosResult>(listArtistPhotosIR);


