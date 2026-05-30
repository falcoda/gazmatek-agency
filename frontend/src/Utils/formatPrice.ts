import type { AppLanguage } from "@/i18n/config";

import { localeFromLang } from "./locale";

export function formatPriceCents(
  cents: number | null | undefined,
  lang: AppLanguage = "fr",
): string {
  if (cents === null || cents === undefined) return "—";
  const euros = cents / 100;
  return new Intl.NumberFormat(localeFromLang(lang), {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(euros);
}

export function formatPercent(ratio: number, lang: AppLanguage = "fr"): string {
  return new Intl.NumberFormat(localeFromLang(lang), {
    style: "percent",
    maximumFractionDigits: 1,
  }).format(ratio);
}
