/** Types generated for queries found in "src/db/query/artist/updateArtistSelfProfile.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

/** 'UpdateArtistSelfProfile' parameters type */
export interface IUpdateArtistSelfProfileParams {
  address?: string | null | void;
  artistId: string;
  bioEn?: string | null | void;
  bioFr?: string | null | void;
  bioNl?: string | null | void;
  companyNumber?: string | null | void;
  country?: string | null | void;
  coverImageUrl?: string | null | void;
  fullName?: string | null | void;
  phone?: string | null | void;
  socialLinks?: Json | null | void;
  technicalInfoEn?: string | null | void;
  technicalInfoFr?: string | null | void;
  technicalInfoNl?: string | null | void;
  vatNumber?: string | null | void;
}

/** 'UpdateArtistSelfProfile' return type */
export interface IUpdateArtistSelfProfileResult {
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

/** 'UpdateArtistSelfProfile' query type */
export interface IUpdateArtistSelfProfileQuery {
  params: IUpdateArtistSelfProfileParams;
  result: IUpdateArtistSelfProfileResult;
}

const updateArtistSelfProfileIR: any = {"usedParamSet":{"bioFr":true,"bioNl":true,"bioEn":true,"technicalInfoFr":true,"technicalInfoNl":true,"technicalInfoEn":true,"socialLinks":true,"coverImageUrl":true,"fullName":true,"phone":true,"address":true,"country":true,"vatNumber":true,"companyNumber":true,"artistId":true},"params":[{"name":"bioFr","required":false,"transform":{"type":"scalar"},"locs":[{"a":37,"b":42}]},{"name":"bioNl","required":false,"transform":{"type":"scalar"},"locs":[{"a":76,"b":81}]},{"name":"bioEn","required":false,"transform":{"type":"scalar"},"locs":[{"a":115,"b":120}]},{"name":"technicalInfoFr","required":false,"transform":{"type":"scalar"},"locs":[{"a":165,"b":180}]},{"name":"technicalInfoNl","required":false,"transform":{"type":"scalar"},"locs":[{"a":236,"b":251}]},{"name":"technicalInfoEn","required":false,"transform":{"type":"scalar"},"locs":[{"a":307,"b":322}]},{"name":"socialLinks","required":false,"transform":{"type":"scalar"},"locs":[{"a":373,"b":384}]},{"name":"coverImageUrl","required":false,"transform":{"type":"scalar"},"locs":[{"a":433,"b":446}]},{"name":"fullName","required":false,"transform":{"type":"scalar"},"locs":[{"a":492,"b":500}]},{"name":"phone","required":false,"transform":{"type":"scalar"},"locs":[{"a":536,"b":541}]},{"name":"address","required":false,"transform":{"type":"scalar"},"locs":[{"a":575,"b":582}]},{"name":"country","required":false,"transform":{"type":"scalar"},"locs":[{"a":618,"b":625}]},{"name":"vatNumber","required":false,"transform":{"type":"scalar"},"locs":[{"a":664,"b":673}]},{"name":"companyNumber","required":false,"transform":{"type":"scalar"},"locs":[{"a":719,"b":732}]},{"name":"artistId","required":true,"transform":{"type":"scalar"},"locs":[{"a":786,"b":795}]}],"statement":"UPDATE artists\nSET bio_fr = COALESCE(:bioFr, bio_fr),\n    bio_nl = COALESCE(:bioNl, bio_nl),\n    bio_en = COALESCE(:bioEn, bio_en),\n    technical_info_fr = COALESCE(:technicalInfoFr, technical_info_fr),\n    technical_info_nl = COALESCE(:technicalInfoNl, technical_info_nl),\n    technical_info_en = COALESCE(:technicalInfoEn, technical_info_en),\n    social_links = COALESCE(:socialLinks, social_links),\n    cover_image_url = COALESCE(:coverImageUrl, cover_image_url),\n    full_name = COALESCE(:fullName, full_name),\n    phone = COALESCE(:phone, phone),\n    address = COALESCE(:address, address),\n    country = COALESCE(:country, country),\n    vat_number = COALESCE(:vatNumber, vat_number),\n    company_number = COALESCE(:companyNumber, company_number),\n    updated_at = NOW()\nWHERE id = :artistId!\nRETURNING id, slug, stage_name, bio_fr, bio_nl, bio_en,\n          technical_info_fr, technical_info_nl, technical_info_en,\n          social_links, cover_image_url, genre,\n          full_name, phone,\n          address, country, vat_number, company_number,\n          onboarding_completed_at"};

/**
 * Query generated from SQL:
 * ```
 * UPDATE artists
 * SET bio_fr = COALESCE(:bioFr, bio_fr),
 *     bio_nl = COALESCE(:bioNl, bio_nl),
 *     bio_en = COALESCE(:bioEn, bio_en),
 *     technical_info_fr = COALESCE(:technicalInfoFr, technical_info_fr),
 *     technical_info_nl = COALESCE(:technicalInfoNl, technical_info_nl),
 *     technical_info_en = COALESCE(:technicalInfoEn, technical_info_en),
 *     social_links = COALESCE(:socialLinks, social_links),
 *     cover_image_url = COALESCE(:coverImageUrl, cover_image_url),
 *     full_name = COALESCE(:fullName, full_name),
 *     phone = COALESCE(:phone, phone),
 *     address = COALESCE(:address, address),
 *     country = COALESCE(:country, country),
 *     vat_number = COALESCE(:vatNumber, vat_number),
 *     company_number = COALESCE(:companyNumber, company_number),
 *     updated_at = NOW()
 * WHERE id = :artistId!
 * RETURNING id, slug, stage_name, bio_fr, bio_nl, bio_en,
 *           technical_info_fr, technical_info_nl, technical_info_en,
 *           social_links, cover_image_url, genre,
 *           full_name, phone,
 *           address, country, vat_number, company_number,
 *           onboarding_completed_at
 * ```
 */
export const updateArtistSelfProfile = new PreparedQuery<IUpdateArtistSelfProfileParams,IUpdateArtistSelfProfileResult>(updateArtistSelfProfileIR);


