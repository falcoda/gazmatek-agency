import { getPagePath, type PageKey, PAGES } from "@/config/pages";
import { useOptionalLanguage } from "@/hooks/useLanguage";

/**
 * Returns a builder that resolves a page key to its href — localized when a
 * supported language is present in the route, otherwise the plain path.
 */
export function useLocalizedHref(): (page: PageKey) => string {
  const language = useOptionalLanguage();
  return (page) => (language ? getPagePath(page, language) : PAGES[page]);
}
