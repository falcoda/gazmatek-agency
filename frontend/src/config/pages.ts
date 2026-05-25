import type { AppLanguage } from "../i18n/config";
import { buildLocalizedPath } from "../i18n/routing";
import { I18N_ROUTING } from "./site";

export const PAGES = {
  main: "/",
  // The login page is NOT shipped with the template. The route guards
  // (ProtectedRoute / PublicRoute) redirect here, so the project must
  // implement a login page and register this route in its routers.
  login: "/login",
} as const;

export type PageKey = keyof typeof PAGES;

export function getPagePath(page: PageKey, language?: AppLanguage): string {
  const pagePath = PAGES[page];

  if (I18N_ROUTING && language) {
    return buildLocalizedPath(language, pagePath);
  }

  return pagePath;
}
