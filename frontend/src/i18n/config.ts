export const SUPPORTED_LANGUAGES = ["fr", "nl", "en"] as const;

export type AppLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const DEFAULT_LANGUAGE: AppLanguage = "fr";
export const LANGUAGE_STORAGE_KEY = "i18nextLng";
