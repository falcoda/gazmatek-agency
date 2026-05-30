import { listContentBlocks } from "@src/db/query/content/listContentBlocks.types";
import { DEFAULT_LOCALE, SupportedLocale } from "@src/helpers/constants/domain";
import { Pool } from "pg";

export type PublicContentBlocks = Record<string, string | null>;

export class ContentService {
  constructor(private db: Pool) {}

  /**
   * Returns the public content blocks resolved for the requested locale.
   *
   * Each block exposes a localized value with a deterministic fallback chain:
   * requested locale -> default locale -> English -> null.
   */
  async getPublicBlocks(lang: SupportedLocale): Promise<PublicContentBlocks> {
    const rows = await listContentBlocks.run(undefined, this.db);
    const map: PublicContentBlocks = {};

    for (const block of rows) {
      const localized =
        lang === "nl"
          ? block.value_nl
          : lang === "en"
            ? block.value_en
            : block.value_fr;

      const defaultLocaleValue =
        DEFAULT_LOCALE === "nl"
          ? block.value_nl
          : DEFAULT_LOCALE === "en"
            ? block.value_en
            : block.value_fr;

      map[block.key] =
        localized ?? defaultLocaleValue ?? block.value_en ?? null;
    }

    return map;
  }
}

export default ContentService;
