import type { ReactNode } from "react";

import ElementNavBar from "./ElementNavbar/ElementNavbar";
import { NavItemType } from "./Navbar";
import SubMenuNavbar from "./SubMenuNavbar/SubMenuNavbar";

interface RenderNavItemsOptions {
  navItems: NavItemType[];
  open?: boolean;
  showLinkLogo?: boolean;
  showSections?: boolean;
  toggleNavbar?: () => void;
  onLinkClick?: () => void;
}

/**
 * Builds the navbar list and inserts a section label before the first item
 * of each new section. Shared by the desktop and mobile navbars.
 */
const renderNavItems = ({
  navItems,
  open = true,
  showLinkLogo = true,
  showSections = true,
  toggleNavbar,
  onLinkClick,
}: RenderNavItemsOptions): ReactNode[] => {
  const nodes: ReactNode[] = [];
  let lastSection: string | undefined;

  navItems.forEach((item) => {
    if (showSections && item.section && item.section !== lastSection) {
      nodes.push(
        <li key={`navSection-${item.section}`} className="navSectionLabel">
          {item.section}
        </li>,
      );
    }

    if (item.section) {
      lastSection = item.section;
    }

    nodes.push(
      item.type === "submenu" ? (
        <SubMenuNavbar
          key={item.text}
          navItem={item}
          openParent={open}
          showLinkLogo={showLinkLogo}
          toggleNavbar={toggleNavbar}
        />
      ) : (
        <ElementNavBar
          key={(item.href ?? "") + item.text}
          navItem={item}
          open={open}
          showLinkLogo={showLinkLogo}
          onLinkClick={onLinkClick}
        />
      ),
    );
  });

  return nodes;
};

export default renderNavItems;
