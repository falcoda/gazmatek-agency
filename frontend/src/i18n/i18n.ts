import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import { DEFAULT_LANGUAGE } from "./config";
import { getStoredLanguage } from "./routing";
import en from "./translations/en.json";
import fr from "./translations/fr.json";
import nl from "./translations/nl.json";

i18n.use(initReactI18next).init({
  resources: {
    fr: { translation: fr },
    nl: { translation: nl },
    en: { translation: en },
  },
  lng: getStoredLanguage() ?? DEFAULT_LANGUAGE,
  fallbackLng: DEFAULT_LANGUAGE,
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
