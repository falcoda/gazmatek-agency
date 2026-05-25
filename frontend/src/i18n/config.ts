export const SUPPORTED_LANGUAGES = ["en", "fr"] as const;

export type AppLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const DEFAULT_LANGUAGE: AppLanguage = "en";
export const LANGUAGE_STORAGE_KEY = "i18nextLng";
