import { useTranslation } from "react-i18next";

import { Home } from "@/assets/svg/svgIcons";

import { NavItemType } from "../covaltech-react-ui/Navbar/Navbar";
import useEnvironment from "./useEnvironment";
import { useLocalizedHref } from "./useLocalizedHref";

const useNavItems = () => {
  const { environment } = useEnvironment();
  const { t } = useTranslation();
  const buildHref = useLocalizedHref();

  let navItems: NavItemType[] = [
    {
      href: buildHref("main"),
      text: t("nav.home"),
      icon: <Home />,
      className: "Home",
    },
    {
      href: buildHref("artists"),
      text: t("nav.artists"),
      className: "Artists",
    },
    {
      href: buildHref("pricing"),
      text: t("nav.pricing"),
      className: "Pricing",
    },
    {
      href: buildHref("contact"),
      text: t("nav.contact"),
      className: "Contact",
    },
  ];

  if (environment === "development") {
    navItems = navItems.concat([]);
  }

  return navItems;
};

export default useNavItems;
