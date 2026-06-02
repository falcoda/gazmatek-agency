import "./LegalPage.scss";

import { useTranslation } from "react-i18next";

import SeoHead from "@/components/SeoHead/SeoHead";

interface LegalSection {
  title: string;
  paragraphs: string[];
}

type LegalNamespace = "terms" | "privacy";

interface LegalPageProps {
  namespace: LegalNamespace;
  path: string;
}

const LegalPage = ({ namespace, path }: LegalPageProps) => {
  const { t } = useTranslation();

  const rawSections = t(`legal.${namespace}.sections`, {
    returnObjects: true,
  });
  // `returnObjects` falls back to the raw key string when the namespace is
  // missing in the active locale, so guard before mapping to avoid a crash.
  const sections: LegalSection[] = Array.isArray(rawSections)
    ? (rawSections as LegalSection[])
    : [];

  return (
    <div className="legalPage">
      <SeoHead
        title={t(`seo.${namespace}.title`)}
        description={t(`seo.${namespace}.description`)}
        path={path}
      />

      <h1 className="title">{t(`legal.${namespace}.title`)}</h1>
      <p className="lastUpdated">{t("legal.lastUpdated")}</p>

      <div className="content">
        <p className="intro">{t(`legal.${namespace}.intro`)}</p>

        {sections.map((section) => (
          <div className="chapter" key={section.title}>
            <h2 className="chapterTitle">{section.title}</h2>
            {section.paragraphs.map((paragraph, index) => (
              <p className="chapterText" key={index}>
                {paragraph}
              </p>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LegalPage;
