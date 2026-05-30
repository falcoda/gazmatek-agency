import "./Footer.scss";

import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { getPagePath, PAGES } from "@/config/pages";
import { useOptionalLanguage } from "@/hooks/useLanguage";

const Footer = () => {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  const language = useOptionalLanguage();
  const termsHref = language ? getPagePath("terms", language) : PAGES.terms;
  const privacyHref = language
    ? getPagePath("privacy", language)
    : PAGES.privacy;

  return (
    <footer className="footer">
      <div className="inner">
        <div className="brand">
          <span className="brandName">Gazmatek</span>
          <span className="tagline">{t("footer.tagline")}</span>
        </div>
        <nav className="legal" aria-label="legal">
          <Link to={termsHref}>{t("footer.legal.terms")}</Link>
          <span aria-hidden="true">·</span>
          <Link to={privacyHref}>{t("footer.legal.privacy")}</Link>
        </nav>
        <p className="rights">{t("footer.rights", { year })}</p>
      </div>
    </footer>
  );
};

export default Footer;
