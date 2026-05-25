import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

import { Home } from "@/assets/svg/svgIcons";

import { getPagePath, PAGES } from "../config/pages";
import { NavItemType } from "../covaltech-react-ui/Navbar/Navbar";
import { isSupportedLanguage } from "../i18n/routing";
import useEnvironment from "./useEnvironment";

// Hook for the navigation items
const useNavItems = () => {
  const { environment } = useEnvironment();
  const { lang } = useParams<{ lang: string }>();
  const { t } = useTranslation();

  const homeHref = isSupportedLanguage(lang)
    ? getPagePath("main", lang)
    : PAGES.main;

  let navItems: NavItemType[] = [
    { href: homeHref, text: t("nav.home"), icon: <Home />, className: "Home" },
  ];

  // Add development only items
  if (environment === "development") {
    navItems = navItems.concat([]);
  }

  return navItems;
};

export default useNavItems;
