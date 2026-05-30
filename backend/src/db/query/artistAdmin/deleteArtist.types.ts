/** Types generated for queries found in "src/db/query/artistAdmin/deleteArtist.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'DeleteArtist' parameters type */
export interface IDeleteArtistParams {
  artistId: string;
}

/** 'DeleteArtist' return type */
export interface IDeleteArtistResult {
  id: string;
}

/** 'DeleteArtist' query type */
export interface IDeleteArtistQuery {
  params: IDeleteArtistParams;
  result: IDeleteArtistResult;
}

const deleteArtistIR: any = {"usedParamSet":{"artistId":true},"params":[{"name":"artistId","required":true,"transform":{"type":"scalar"},"locs":[{"a":31,"b":40}]}],"statement":"DELETE FROM artists\nWHERE id = :artistId!\nRETURNING id"};

/**
 * Query generated from SQL:
 * ```
 * DELETE FROM artists
 * WHERE id = :artistId!
 * RETURNING id
 * ```
 */
export const deleteArtist = new PreparedQuery<IDeleteArtistParams,IDeleteArtistResult>(deleteArtistIR);


