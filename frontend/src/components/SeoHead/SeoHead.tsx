import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";

import { I18N_ROUTING, SITE_NAME, SITE_URL } from "../../config/site";
import { CONTACT_EMAIL, SOCIAL_LINKS } from "../../config/socials";
import {
  type AppLanguage,
  DEFAULT_LANGUAGE,
  SUPPORTED_LANGUAGES,
} from "../../i18n/config";
import { isSupportedLanguage } from "../../i18n/routing";

const LOGO_URL = `${SITE_URL}/logo-400x400.png`;

const OG_LOCALES: Record<AppLanguage, string> = {
  fr: "fr_BE",
  nl: "nl_BE",
  en: "en_US",
};

/** Open Graph object types we emit. */
export type OgType = "website" | "profile" | "music.musician" | "article";

interface SeoHeadProps {
  title?: string;
  description?: string;
  path?: string;
  ogImage?: string;
  /** Open Graph `og:type`. Defaults to "website". (#63) */
  ogType?: OgType;
}

/** Builds the URL for a clean (unlocalized) path in a given language. */
const buildLocalizedUrl = (
  cleanPath: string,
  language: AppLanguage,
): string => {
  if (!I18N_ROUTING) return `${SITE_URL}${cleanPath}`;
  const localized =
    cleanPath === "/" ? `/${language}/` : `/${language}${cleanPath}`;
  return `${SITE_URL}${localized}`;
};

const SeoHead = ({
  title,
  description,
  path,
  ogImage,
  ogType = "website",
}: SeoHeadProps) => {
  const { t, i18n } = useTranslation();
  const lang = isSupportedLanguage(i18n.resolvedLanguage)
    ? i18n.resolvedLanguage
    : DEFAULT_LANGUAGE;

  const resolvedTitle = title ?? t("seo.title");
  const resolvedDescription = description ?? t("seo.description");
  const cleanPath = path ? (path.startsWith("/") ? path : `/${path}`) : "/";
  const canonicalUrl = buildLocalizedUrl(cleanPath, lang);
  const ogImageUrl = ogImage ?? LOGO_URL;

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: LOGO_URL,
    email: CONTACT_EMAIL,
    description: resolvedDescription,
    sameAs: Object.values(SOCIAL_LINKS).filter((link) => link && link !== "#"),
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    inLanguage: [...SUPPORTED_LANGUAGES],
    publisher: { "@type": "Organization", name: SITE_NAME },
  };

  return (
    <Helmet>
      <html lang={lang} />
      <title>{resolvedTitle}</title>
      <meta name="description" content={resolvedDescription} />
      <link rel="canonical" href={canonicalUrl} />
      {/* hreflang alternates so search engines surface the right locale. (#35) */}
      {I18N_ROUTING
        ? SUPPORTED_LANGUAGES.map((other) => (
            <link
              key={other}
              rel="alternate"
              hrefLang={other}
              href={buildLocalizedUrl(cleanPath, other)}
            />
          ))
        : null}
      {I18N_ROUTING ? (
        <link
          rel="alternate"
          hrefLang="x-default"
          href={buildLocalizedUrl(cleanPath, DEFAULT_LANGUAGE)}
        />
      ) : null}
      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={resolvedTitle} />
      <meta property="og:description" content={resolvedDescription} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={ogImageUrl} />
      <meta property="og:locale" content={OG_LOCALES[lang]} />
      {SUPPORTED_LANGUAGES.filter((other) => other !== lang).map((other) => (
        <meta
          key={other}
          property="og:locale:alternate"
          content={OG_LOCALES[other]}
        />
      ))}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={resolvedTitle} />
      <meta name="twitter:description" content={resolvedDescription} />
      <meta name="twitter:image" content={ogImageUrl} />
      <script type="application/ld+json">
        {JSON.stringify(organizationSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(websiteSchema)}
      </script>
    </Helmet>
  );
};

export default SeoHead;
