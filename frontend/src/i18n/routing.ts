import {
  type AppLanguage,
  DEFAULT_LANGUAGE,
  LANGUAGE_STORAGE_KEY,
  SUPPORTED_LANGUAGES,
} from "./config";

export function isSupportedLanguage(
  value: string | null | undefined,
): value is AppLanguage {
  return Boolean(value && SUPPORTED_LANGUAGES.includes(value as AppLanguage));
}

export function getStoredLanguage(): AppLanguage | null {
  if (typeof window === "undefined") {
    return null;
  }

  const storedLanguage = window.localStorage
    .getItem(LANGUAGE_STORAGE_KEY)
    ?.toLowerCase();

  return isSupportedLanguage(storedLanguage) ? storedLanguage : null;
}

export function detectPreferredLanguage(): AppLanguage {
  const storedLanguage = getStoredLanguage();

  if (storedLanguage) {
    return storedLanguage;
  }

  if (typeof navigator !== "undefined") {
    const browserLanguage = navigator.language.split("-")[0]?.toLowerCase();

    if (isSupportedLanguage(browserLanguage)) {
      return browserLanguage;
    }
  }

  return DEFAULT_LANGUAGE;
}

export function stripLanguagePrefix(pathname: string): string {
  const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const [, firstSegment, ...restSegments] = normalizedPath.split("/");

  if (!isSupportedLanguage(firstSegment)) {
    return normalizedPath;
  }

  const remainingPath = restSegments.join("/");

  return remainingPath ? `/${remainingPath}` : "/";
}

export function buildLocalizedPath(
  language: AppLanguage,
  pathname: string = "/",
): string {
  const normalizedPath = stripLanguagePrefix(pathname);

  return normalizedPath === "/"
    ? `/${language}/`
    : `/${language}${normalizedPath}`;
}
