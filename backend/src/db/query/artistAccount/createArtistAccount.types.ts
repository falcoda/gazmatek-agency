/** Types generated for queries found in "src/db/query/artistAccount/createArtistAccount.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'CreateArtistAccount' parameters type */
export interface ICreateArtistAccountParams {
  artistId: string;
  email: string;
  passwordHash: string;
}

/** 'CreateArtistAccount' return type */
export interface ICreateArtistAccountResult {
  artist_id: string;
  created_at: Date;
  email: string;
}

/** 'CreateArtistAccount' query type */
export interface ICreateArtistAccountQuery {
  params: ICreateArtistAccountParams;
  result: ICreateArtistAccountResult;
}

const createArtistAccountIR: any = {"usedParamSet":{"artistId":true,"email":true,"passwordHash":true},"params":[{"name":"artistId","required":true,"transform":{"type":"scalar"},"locs":[{"a":70,"b":79}]},{"name":"email","required":true,"transform":{"type":"scalar"},"locs":[{"a":82,"b":88}]},{"name":"passwordHash","required":true,"transform":{"type":"scalar"},"locs":[{"a":91,"b":104}]}],"statement":"INSERT INTO artist_accounts (artist_id, email, password_hash)\nVALUES (:artistId!, :email!, :passwordHash!)\nRETURNING artist_id, email, created_at"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO artist_accounts (artist_id, email, password_hash)
 * VALUES (:artistId!, :email!, :passwordHash!)
 * RETURNING artist_id, email, created_at
 * ```
 */
export const createArtistAccount = new PreparedQuery<ICreateArtistAccountParams,ICreateArtistAccountResult>(createArtistAccountIR);


