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

interface SeoHeadProps {
  title?: string;
  description?: string;
  path?: string;
  ogImage?: string;
}

const SeoHead = ({ title, description, path, ogImage }: SeoHeadProps) => {
  const { t, i18n } = useTranslation();
  const lang = isSupportedLanguage(i18n.resolvedLanguage)
    ? i18n.resolvedLanguage
    : DEFAULT_LANGUAGE;

  const resolvedTitle = title ?? t("seo.title");
  const resolvedDescription = description ?? t("seo.description");
  const cleanPath = path ? (path.startsWith("/") ? path : `/${path}`) : "/";
  const localizedPath =
    I18N_ROUTING && cleanPath === "/"
      ? `/${lang}/`
      : I18N_ROUTING
        ? `/${lang}${cleanPath}`
        : cleanPath;
  const canonicalUrl = `${SITE_URL}${localizedPath}`;
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
