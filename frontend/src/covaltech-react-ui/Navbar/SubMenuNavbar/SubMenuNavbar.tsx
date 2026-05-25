import React, { useState } from "react";
import { ChevronDown } from "../../../assets/svg/svgIcons";
import ElementNavBar from "../ElementNavbar/ElementNavbar";
import { NavItemType } from "../Navbar";
import "./SubMenuNavbar.scss";

interface SubMenuNavbarProps {
  navItem: NavItemType;
  openParent?: boolean;
  showLinkLogo?: boolean;
  toggleNavbar?: () => void;
}

const SubMenuNavbar: React.FC<SubMenuNavbarProps> = ({
  navItem,
  openParent = true,
  showLinkLogo = true,
  toggleNavbar,
}) => {
  const [open, setOpen] = useState(true);

  if (!navItem.submenu) return null;

  const handleToggle = () => {
    setOpen((prev) => !prev);
  };

  return (
    <li className={`nav-item submenu-navbar ${open ? "open" : "closed"}`}>
      <div
        className="submenu-header nav-link"
        onClick={handleToggle}
        tabIndex={0}
        role="button"
        aria-expanded={open}
      >
        {navItem.icon && navItem.icon}
        {openParent && <span className="link-text">{navItem.text}</span>}
        <span className={`chevron ${open ? "open" : ""}`}>
          <ChevronDown />
        </span>
      </div>

      <ul className={`submenu-list ${open ? "open" : ""}`}>
        {navItem.submenu.map((item) => (
          <ElementNavBar
            key={item.href + item.text}
            navItem={item}
            open={openParent}
            showLinkLogo={showLinkLogo}
            onLinkClick={toggleNavbar}
          />
        ))}
      </ul>
    </li>
  );
};

export default SubMenuNavbar;
