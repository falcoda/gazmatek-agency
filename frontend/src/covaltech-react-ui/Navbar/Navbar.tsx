import React, { memo } from "react";

import { BreakpointKeys, breakpoints } from "../config/breakpoints";
import useWindowWidth from "../hooks/useWindowWidth";
import DesktopNavbar, { ClosableNavbar } from "./DesktopNavbar/DesktopNavbar";
import MobileNavbar from "./MobileNavbar/MobileNavbar";
import "./Navbar.scss";

export type NavItemType = {
  type?: "submenu" | "link";
  href?: string;
  link?: string;
  text: string;
  icon?: React.ReactNode;
  className?: string;
  submenu?: NavItemType[];
  hilight?: boolean;
  /** Count pill rendered on the right side of the item. */
  badge?: string | number;
  /** Section label; a header is rendered before the first item of each section. */
  section?: string;
};

interface NavbarProps {
  navItems: NavItemType[];
  beforeChildren?: React.ReactNode;
  children?: React.ReactNode;
  closeable?: ClosableNavbar;
  mobileBeforeChildren?: React.ReactNode;
  mobileChildren?: React.ReactNode;
  showLogo?: boolean;
  showLinkLogo?: boolean;
  breakpoint?: BreakpointKeys;
  scrollToContainer?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({
  navItems,
  children,
  beforeChildren,
  mobileBeforeChildren,
  mobileChildren,
  closeable = {
    closeable: false,
    defaultOpen: true,
    closedNavbarWidth: "90px",
  },
  showLogo = true,
  showLinkLogo = true,
  breakpoint = "breakpoint-md-2",
  scrollToContainer = false,
}) => {
  const { windowWidth } = useWindowWidth();

  return (
    <>
      {windowWidth > breakpoints[breakpoint] ? (
        <DesktopNavbar
          navItems={navItems}
          beforeChildren={beforeChildren}
          closeable={closeable}
          showLogo={showLogo}
          showLinkLogo={showLinkLogo}
        >
          {children}
        </DesktopNavbar>
      ) : (
        <MobileNavbar
          navItems={navItems}
          showLinkLogo={showLinkLogo}
          mobileBeforeChildren={mobileBeforeChildren}
          scrollToContainer={scrollToContainer}
        >
          {mobileChildren}
        </MobileNavbar>
      )}
    </>
  );
};

export default memo(Navbar);
