import { useParams } from "react-router-dom";

import type { AppLanguage } from "@/i18n/config";
import { DEFAULT_LANGUAGE } from "@/i18n/config";
import { isSupportedLanguage } from "@/i18n/routing";

/**
 * Reads the `:lang` route param and returns it only when it is a supported
 * language, otherwise `undefined`. Use this when the absence of a language
 * should fall back to the non-localized path (nav, auth pages).
 */
export function useOptionalLanguage(): AppLanguage | undefined {
  const { lang } = useParams<{ lang: string }>();
  return isSupportedLanguage(lang) ? lang : undefined;
}

/**
 * Same as {@link useOptionalLanguage} but falls back to the default language.
 * Use this when a concrete language is always required (locale formatting,
 * localized links on booking pages).
 */
export function useLanguage(): AppLanguage {
  return useOptionalLanguage() ?? DEFAULT_LANGUAGE;
}
