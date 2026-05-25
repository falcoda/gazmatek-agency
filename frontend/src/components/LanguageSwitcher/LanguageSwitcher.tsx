import "./LanguageSwitcher.scss";

import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

import {
  type AppLanguage,
  DEFAULT_LANGUAGE,
  SUPPORTED_LANGUAGES,
} from "../../i18n/config";
import { buildLocalizedPath, isSupportedLanguage } from "../../i18n/routing";

interface LanguageSwitcherProps {
  mobile?: boolean;
  toggleNavbar?: () => void;
}

const LanguageSwitcher = ({
  mobile = false,
  toggleNavbar,
}: LanguageSwitcherProps) => {
  const { t } = useTranslation();
  const { lang } = useParams<{ lang: string }>();
  const navigate = useNavigate();

  const currentLanguage = isSupportedLanguage(lang) ? lang : DEFAULT_LANGUAGE;

  const setLanguage = (newLang: AppLanguage) => {
    if (currentLanguage === newLang) return;
    navigate(buildLocalizedPath(newLang));

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
