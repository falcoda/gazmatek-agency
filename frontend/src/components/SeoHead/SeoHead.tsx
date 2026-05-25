import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";

import { I18N_ROUTING, SITE_NAME, SITE_URL } from "../../config/site";
import { CONTACT_EMAIL, SOCIAL_LINKS } from "../../config/socials";
import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES } from "../../i18n/config";
import { isSupportedLanguage } from "../../i18n/routing";

const LOGO_URL = `${SITE_URL}/logo-400x400.png`;

const SeoHead = () => {
  const { t, i18n } = useTranslation();
  const lang = isSupportedLanguage(i18n.resolvedLanguage)
    ? i18n.resolvedLanguage
    : DEFAULT_LANGUAGE;
  const canonicalUrl = I18N_ROUTING ? `${SITE_URL}/${lang}/` : `${SITE_URL}/`;

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: LOGO_URL,
    email: CONTACT_EMAIL,
    description: t("seo.description"),
    sameAs: Object.values(SOCIAL_LINKS).filter(Boolean),
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
      <title>{t("seo.title")}</title>
      <meta name="description" content={t("seo.description")} />
      <link rel="canonical" href={canonicalUrl} />
      <meta property="og:title" content={t("seo.title")} />
      <meta property="og:description" content={t("seo.description")} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:locale" content={lang === "fr" ? "fr_FR" : "en_US"} />
      <meta
        property="og:locale:alternate"
        content={lang === "fr" ? "en_US" : "fr_FR"}
      />
      <meta name="twitter:title" content={t("seo.title")} />
      <meta name="twitter:description" content={t("seo.description")} />
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
