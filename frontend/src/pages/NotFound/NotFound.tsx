import "./NotFound.scss";

import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { getPagePath } from "@/config/pages";
import { isSupportedLanguage } from "@/i18n/routing";

const NotFound = () => {
  const { t, i18n } = useTranslation();

  const lang = i18n.resolvedLanguage;
  const homeHref = getPagePath(
    "main",
    isSupportedLanguage(lang) ? lang : undefined,
  );

  return (
    <div className="notFound">
      <div className="notFoundInner">
        <span className="notFoundCode" aria-hidden="true">
          404
        </span>
        <h1 className="notFoundTitle">{t("notFound.title")}</h1>
        <p className="notFoundText">{t("notFound.text")}</p>
        <Link to={homeHref} className="notFoundLink">
          {t("notFound.back")}
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
