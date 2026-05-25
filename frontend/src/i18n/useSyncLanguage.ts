import { useEffect } from "react";
import { useTranslation } from "react-i18next";

import { type AppLanguage, LANGUAGE_STORAGE_KEY } from "./config";

function useSyncLanguage(language: AppLanguage | null) {
  const { i18n } = useTranslation();

  useEffect(() => {
    if (!language) {
      return;
    }

    if (i18n.resolvedLanguage !== language) {
      void i18n.changeLanguage(language);
    }

    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    document.documentElement.lang = language;
  }, [i18n, language]);
}

export default useSyncLanguage;
