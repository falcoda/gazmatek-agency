import { useTranslation } from "react-i18next";

import type { NavItemType } from "../covaltech-react-ui/Navbar/Navbar";
import { useLocalizedHref } from "./useLocalizedHref";

const useArtistNavItems = (): NavItemType[] => {
  const { t } = useTranslation();
  const buildHref = useLocalizedHref();

  return [
    {
      href: buildHref("artistBookings"),
      text: t("artistArea.nav.allBookings"),
      className: "ArtistBookings",
    },
    {
      href: buildHref("artistCalendar"),
      text: t("artistArea.nav.calendar"),
      className: "ArtistCalendar",
    },
    {
      href: buildHref("artistProfile"),
      text: t("artistArea.nav.profile"),
      className: "ArtistProfile",
    },
  ];
};

export default useArtistNavItems;
