import type { AppLanguage } from "@/i18n/config";
import { DEFAULT_LANGUAGE } from "@/i18n/config";

/**
 * Maps an application language to its BCP-47 locale used by `Intl.*` APIs.
 * Single source of truth — never inline `lang === "fr" ? "fr-BE" : ...` again.
 */
export const LOCALE_BY_LANG: Record<AppLanguage, string> = {
  fr: "fr-BE",
  nl: "nl-BE",
  en: "en-US",
};

export function localeFromLang(lang: AppLanguage = DEFAULT_LANGUAGE): string {
  return LOCALE_BY_LANG[lang];
}
