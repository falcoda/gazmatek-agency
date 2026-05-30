import { useTranslation } from "react-i18next";

import type { NavItemType } from "../covaltech-react-ui/Navbar/Navbar";
import { useLocalizedHref } from "./useLocalizedHref";

const useAdminNavItems = (): NavItemType[] => {
  const { t } = useTranslation();
  const buildHref = useLocalizedHref();

  return [
    {
      href: buildHref("adminArtists"),
      text: t("admin.nav.artists"),
      className: "AdminArtists",
    },
    {
      href: buildHref("adminBookings"),
      text: t("admin.nav.bookings"),
      className: "AdminBookings",
    },
    {
      href: buildHref("adminContent"),
      text: t("admin.nav.content"),
      className: "AdminContent",
    },
    {
      href: buildHref("adminSettings"),
      text: t("admin.nav.settings"),
      className: "AdminSettings",
    },
  ];
};

export default useAdminNavItems;
