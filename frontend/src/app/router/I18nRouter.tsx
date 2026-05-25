import { useEffect } from "react";
import {
  Navigate,
  Route,
  Routes,
  useNavigate,
  useParams,
} from "react-router-dom";

import { getPagePath, PAGES } from "../../config/pages";
import type { AppLanguage } from "../../i18n/config";
import {
  detectPreferredLanguage,
  isSupportedLanguage,
} from "../../i18n/routing";
import useSyncLanguage from "../../i18n/useSyncLanguage";
import AppShell from "../AppShell";
import { Home, NotFound } from "./lazyPages";

function LangRedirect() {
  const language = detectPreferredLanguage();

  return <Navigate to={getPagePath("main", language)} replace />;
}

function LocalizedApp() {
  const { lang } = useParams<{ lang: string }>();
  const navigate = useNavigate();

  const currentLanguage: AppLanguage | null = isSupportedLanguage(lang)
    ? lang
    : null;

  useSyncLanguage(currentLanguage);

  useEffect(() => {
    if (!currentLanguage) {
      navigate(PAGES.main, { replace: true });
    }
  }, [currentLanguage, navigate]);

  if (!currentLanguage) {
    return null;
  }

  return (
    <AppShell showLangSwitcher>
      <Routes>
        <Route index element={<Home />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppShell>
  );
}

function I18nRouter() {
  return (
    <Routes>
      <Route path="/:lang/*" element={<LocalizedApp />} />
      <Route path={PAGES.main} element={<LangRedirect />} />
      <Route path="*" element={<LangRedirect />} />
    </Routes>
  );
}

export default I18nRouter;
