/** Types generated for queries found in "src/db/query/artistAccount/getArtistAccountByEmail.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'GetArtistAccountByEmail' parameters type */
export interface IGetArtistAccountByEmailParams {
  email: string;
}

/** 'GetArtistAccountByEmail' return type */
export interface IGetArtistAccountByEmailResult {
  artist_id: string;
  email: string;
  failed_login_attempts: number;
  is_active: boolean;
  locked_until: Date | null;
  password_hash: string;
  slug: string;
  stage_name: string;
}

/** 'GetArtistAccountByEmail' query type */
export interface IGetArtistAccountByEmailQuery {
  params: IGetArtistAccountByEmailParams;
  result: IGetArtistAccountByEmailResult;
}

const getArtistAccountByEmailIR: any = {"usedParamSet":{"email":true},"params":[{"name":"email","required":true,"transform":{"type":"scalar"},"locs":[{"a":220,"b":226}]}],"statement":"SELECT aa.artist_id, aa.email, aa.password_hash,\n       aa.failed_login_attempts, aa.locked_until, aa.is_active,\n       a.slug, a.stage_name\nFROM artist_accounts aa\nJOIN artists a ON a.id = aa.artist_id\nWHERE aa.email = :email!\nLIMIT 1"};

/**
 * Query generated from SQL:
 * ```
 * SELECT aa.artist_id, aa.email, aa.password_hash,
 *        aa.failed_login_attempts, aa.locked_until, aa.is_active,
 *        a.slug, a.stage_name
 * FROM artist_accounts aa
 * JOIN artists a ON a.id = aa.artist_id
 * WHERE aa.email = :email!
 * LIMIT 1
 * ```
 */
export const getArtistAccountByEmail = new PreparedQuery<IGetArtistAccountByEmailParams,IGetArtistAccountByEmailResult>(getArtistAccountByEmailIR);


