import "./LanguageSwitcher.scss";

import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";

import { useLanguage } from "@/hooks/useLanguage";

import { type AppLanguage, SUPPORTED_LANGUAGES } from "../../i18n/config";
import { buildLocalizedPath, stripLanguagePrefix } from "../../i18n/routing";

interface LanguageSwitcherProps {
  mobile?: boolean;
  toggleNavbar?: () => void;
}

const LanguageSwitcher = ({
  mobile = false,
  toggleNavbar,
}: LanguageSwitcherProps) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const currentLanguage = useLanguage();

  const setLanguage = (newLang: AppLanguage) => {
    if (currentLanguage === newLang) return;

    // 1. Sync i18next state so labels update before navigation.
    void i18n.changeLanguage(newLang);

    // 2. Preserve the current path (so we don't lose context, e.g. switching
    //    language while on /fr/artists/dj-nova lands on /en/artists/dj-nova).
    const currentPathWithoutLang = stripLanguagePrefix(
      location.pathname + location.search,
    );
    const target = buildLocalizedPath(newLang, currentPathWithoutLang);
    navigate(target, { replace: false });

    if (mobile && toggleNavbar) {
      toggleNavbar();
    }
  };

  return (
    <div
      className={`languageSwitcher ${mobile ? "mobile" : ""}`}
      role="group"
      aria-label={t("language.switcher_aria")}
    >
      {SUPPORTED_LANGUAGES.map((language) => (
        <button
          key={language}
          type="button"
          className={currentLanguage === language ? "active" : ""}
          onClick={() => setLanguage(language)}
        >
          {language.toUpperCase()}
        </button>
      ))}
    </div>
  );
};

export default LanguageSwitcher;
