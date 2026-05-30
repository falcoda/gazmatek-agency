import { memo, type ReactNode } from "react";

import useWindowWidth from "@/covaltech-react-ui/hooks/useWindowWidth";

import { breakpoints } from "../../config/breakpoints";
import DesktopPublicNavbar from "./DesktopPublicNavbar/DesktopPublicNavbar";
import MobilePublicNavbar from "./MobilePublicNavbar/MobilePublicNavbar";

interface PublicNavbarProps {
  langSwitcher?: ReactNode;
  mobileLangSwitcher?: ReactNode;
}

const PublicNavbar = ({
  langSwitcher,
  mobileLangSwitcher,
}: PublicNavbarProps) => {
  const { windowWidth } = useWindowWidth();

  return windowWidth > breakpoints["breakpoint-md"] ? (
    <DesktopPublicNavbar langSwitcher={langSwitcher} />
  ) : (
    <MobilePublicNavbar mobileLangSwitcher={mobileLangSwitcher} />
  );
};

export default memo(PublicNavbar);
