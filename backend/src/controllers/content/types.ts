import type { SupportedLocale } from "@src/helpers/constants/domain";
import type { PublicContentBlocks } from "@src/services/content/contentService";

export interface GetPublicContentQuery {
  lang?: SupportedLocale;
}

export interface GetPublicContentResponse {
  data: PublicContentBlocks;
}
