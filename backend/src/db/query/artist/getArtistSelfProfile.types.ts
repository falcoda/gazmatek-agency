/** Types generated for queries found in "src/db/query/artist/getArtistSelfProfile.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

/** 'GetArtistSelfProfile' parameters type */
export interface IGetArtistSelfProfileParams {
  artistId: string;
}

/** 'GetArtistSelfProfile' return type */
export interface IGetArtistSelfProfileResult {
  address: string | null;
  bio_en: string | null;
  bio_fr: string | null;
  bio_nl: string | null;
  company_number: string | null;
  country: string | null;
  cover_image_url: string | null;
  full_name: string | null;
  genre: string | null;
  id: string;
  onboarding_completed_at: Date | null;
  phone: string | null;
  slug: string;
  social_links: Json;
  stage_name: string;
  technical_info_en: string | null;
  technical_info_fr: string | null;
  technical_info_nl: string | null;
  vat_number: string | null;
}

/** 'GetArtistSelfProfile' query type */
export interface IGetArtistSelfProfileQuery {
  params: IGetArtistSelfProfileParams;
  result: IGetArtistSelfProfileResult;
}

const getArtistSelfProfileIR: any = {"usedParamSet":{"artistId":true},"params":[{"name":"artistId","required":true,"transform":{"type":"scalar"},"locs":[{"a":295,"b":304}]}],"statement":"SELECT id, slug, stage_name, bio_fr, bio_nl, bio_en,\n       technical_info_fr, technical_info_nl, technical_info_en,\n       social_links, cover_image_url, genre,\n       full_name, phone,\n       address, country, vat_number, company_number,\n       onboarding_completed_at\nFROM artists\nWHERE id = :artistId!"};

/**
 * Query generated from SQL:
 * ```
 * SELECT id, slug, stage_name, bio_fr, bio_nl, bio_en,
 *        technical_info_fr, technical_info_nl, technical_info_en,
 *        social_links, cover_image_url, genre,
 *        full_name, phone,
 *        address, country, vat_number, company_number,
 *        onboarding_completed_at
 * FROM artists
 * WHERE id = :artistId!
 * ```
 */
export const getArtistSelfProfile = new PreparedQuery<IGetArtistSelfProfileParams,IGetArtistSelfProfileResult>(getArtistSelfProfileIR);


