import "./MobileNavbar.scss";

import React, {
  cloneElement,
  isValidElement,
  memo,
  ReactElement,
  useState,
} from "react";
import { NavLink } from "react-router-dom";

import { Logo } from "../../../assets/svg/svgIcons";
import useHeaderBannerStore from "../../stores/HeaderBannerStore";
import ElementNavBar from "../ElementNavbar/ElementNavbar";
import { NavItemType } from "../Navbar";
import SubMenuNavbar from "../SubMenuNavbar/SubMenuNavbar";
import BurgerClose from "./burger-close.svg?react";
import BurgerOpen from "./burger-open.svg?react";

interface MobileNavbarProps {
  navItems: NavItemType[];
  mobileBeforeChildren?: React.ReactNode;
  children?: React.ReactNode;
  showLinkLogo?: boolean;
  scrollToContainer?: boolean;
}
const MobileNavbar: React.FC<MobileNavbarProps> = ({
  navItems,
  mobileBeforeChildren,
  children,
  showLinkLogo,
  scrollToContainer = false,
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const { visible, height } = useHeaderBannerStore();

  const toggleNavbar = () => {
    setCollapsed(!collapsed);
    // scroll to the .container if the navbar is collapsed and scrollToContainer is true
    if (collapsed && scrollToContainer) {
      const container = document.querySelector(".container");
      if (container) {
        container.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <nav
      className={`mobileNavbar`}
      role="navigation"
      aria-label="Site Navigation"
      style={{ marginTop: visible ? height : 0 }}
    >
      <div className="navbar-toggler">
        <NavLink to="/">
          <Logo />
        </NavLink>
        {collapsed ? (
          <BurgerClose onClick={toggleNavbar} className={`burger-close-btn`} />
        ) : (
          <BurgerOpen onClick={toggleNavbar} className={`burger-open-btn`} />
        )}
      </div>
      <div className={`navbar-collapse ${collapsed ? "show" : ""}`}>
        <ul className="navbar-nav">
          {isValidElement(mobileBeforeChildren) &&
            cloneElement(
              mobileBeforeChildren as ReactElement,
              {
                open,
                toggleNavbar,
              } as any,
            )}

          {navItems.map((item) =>
            item.type === "submenu" ? (
              <SubMenuNavbar
                key={item.text}
                navItem={item}
                showLinkLogo={showLinkLogo}
                toggleNavbar={toggleNavbar}
              />
            ) : (
              <ElementNavBar
                key={item.href + item.text}
                navItem={item}
                showLinkLogo={showLinkLogo}
                onLinkClick={toggleNavbar}
              />
            ),
          )}
        </ul>
        {/* pass toggleNavbar to children */}
        {children &&
          cloneElement(children as ReactElement, { toggleNavbar } as any)}
      </div>
    </nav>
  );
};

export default memo(MobileNavbar);
