import React, { memo } from "react";
import { FiExternalLink } from "react-icons/fi";
import { NavLink } from "react-router-dom";

import { NavItemType } from "../Navbar";
interface ElementNavBarProps {
  navItem: NavItemType;
  onLinkClick?: () => void;
  open?: boolean;
  showLinkLogo?: boolean;
  toggleNavbar?: () => void;
}

const ElementNavBar: React.FC<ElementNavBarProps> = ({
  navItem,
  onLinkClick,
  open = true,
  showLinkLogo = true,
  toggleNavbar,
}) => {
  const handleLinkClick = () => {
    if (navItem.link && toggleNavbar) {
      toggleNavbar();
    }
    if (onLinkClick) {
      onLinkClick();
    }
  };

  // Home route: either "/" or "/:lang/" — needs exact match to avoid matching everything
  const isHomeRoute = navItem.href === "/" || /^\/[a-z]{2}\/?$/.test(navItem.href ?? "");

  return (
    <li className={`nav-item ${navItem.className ?? ""}`}>
      <NavLink
        to={navItem.href ?? navItem.link ?? "/"}
        className={`nav-link`}
        onClick={handleLinkClick}
        aria-current="page"
        end={isHomeRoute}
        target={navItem.link ? "_blank" : "_self"}
      >
        {navItem.icon && navItem.icon}
        {open && (
          <span className="link-text">
            <span className="link-label">{navItem.text}</span>
            {navItem.link && showLinkLogo && (
              <FiExternalLink className="link-externalIcon" />
            )}
            {navItem.badge != null && (
              <span className="navBadge">{navItem.badge}</span>
            )}
          </span>
        )}
      </NavLink>
    </li>
  );
};

export default memo(ElementNavBar);
