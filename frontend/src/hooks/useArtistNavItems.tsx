import { useTranslation } from "react-i18next";

import { useArtistOnboardingStatus } from "@/hooks/useArtistOnboardingStatus";

import type { NavItemType } from "../covaltech-react-ui/Navbar/Navbar";
import { useLocalizedHref } from "./useLocalizedHref";

const useArtistNavItems = (): NavItemType[] => {
  const { t } = useTranslation();
  const buildHref = useLocalizedHref();
  const { onboardingComplete } = useArtistOnboardingStatus();

  const items: NavItemType[] = [
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

  // Surface a discoverable entry to resume onboarding until the engagement
  // contract is signed. (#34)
  if (onboardingComplete === false) {
    items.push({
      href: buildHref("artistOnboardingContract"),
      text: t("artistArea.nav.onboarding"),
      className: "ArtistOnboarding",
      badge: "!",
      hilight: true,
    });
  }

  return items;
};

export default useArtistNavItems;
