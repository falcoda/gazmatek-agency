import React, { memo } from "react";
import { FiExternalLink } from "react-icons/fi";
import { NavLink, useLocation } from "react-router-dom";

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
  const location = useLocation();

  const match = () => {
    if (navItem.href?.split("/")[1] === location.pathname.split("/")[1]) {
      return true;
    }
    return false;
  };

  const handleLinkClick = () => {
    if (navItem.link && toggleNavbar) {
      toggleNavbar();
    }
    if (onLinkClick) {
      onLinkClick();
    }
  };

  return (
    <li
      className={`nav-item ${navItem.className ?? ""} ${match() ? "active" : ""}`}
    >
      <NavLink
        to={navItem.href ?? navItem.link ?? "/"}
        className={`nav-link `}
        onClick={handleLinkClick}
        aria-current="page"
        end={navItem.href === "/"}
        target={navItem.link ? "_blank" : "_self"}
      >
        {navItem.icon && navItem.icon}
        {open && (
          <span className="link-text">
            {navItem.text}
            {navItem.link && showLinkLogo && <FiExternalLink />}
          </span>
        )}
      </NavLink>
    </li>
  );
};

export default memo(ElementNavBar);
