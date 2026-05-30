import "./DesktopNavbar.scss";

import React, { memo, useEffect, useState } from "react";
import { NavLink } from "react-router-dom";

import { Logo, LogoTypo } from "../../../assets/svg/svgIcons";
import Button from "../../Button/Button";
import { NavItemType } from "../Navbar";
import renderNavItems from "../renderNavItems";
import CloseIcon from "./closeIcon.svg?react";
import OpenIcon from "./openIcon.svg?react";

export interface ClosableNavbar {
  closeable: boolean;
  defaultOpen: boolean;
  closedNavbarWidth: string;
}

interface DesktopNavbarProps {
  navItems: NavItemType[];
  beforeChildren?: React.ReactNode;
  children?: React.ReactNode;
  closeable?: ClosableNavbar;
  showLogo?: boolean;
  showLinkLogo?: boolean;
}

const DesktopNavbar = ({
  navItems,
  beforeChildren,
  children,
  closeable = {
    closeable: false,
    defaultOpen: true,
    closedNavbarWidth: "90px",
  },
  showLogo = true,
  showLinkLogo = true,
}: DesktopNavbarProps) => {
  const [open, setOpen] = useState(closeable.defaultOpen);
  const [hover, setHover] = useState(false);

  useEffect(() => {
    const rootStyle = getComputedStyle(document.documentElement);
    const navbarWidth = rootStyle
      .getPropertyValue("--default-navbar-width")
      .trim();
    const newWidth = open ? navbarWidth : closeable.closedNavbarWidth;
    document.documentElement.style.setProperty("--navbar-width", newWidth);
  }, [open]);

  return (
    <nav
      className={`desktopNavbar ${closeable.closeable ? "closeable" : ""} ${open ? "open" : "closed"}`}
      role="navigation"
      aria-label="Site Navigation"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div className={`navbar-collapse`}>
        <ul className="navbar-nav">
          {showLogo && (
            <li className="navTitleDiv">
              <NavLink to="/">
                {open ? (
                  <LogoTypo className="navTitle" />
                ) : (
                  <Logo className="navTitle" />
                )}
              </NavLink>
            </li>
          )}
          {React.isValidElement(beforeChildren) &&
            React.cloneElement(
              beforeChildren as React.ReactElement<{ open?: boolean }>,
              {
                open: open || hover,
              },
            )}
          {closeable.closeable && (
            <Button
              className="openButton"
              width={25}
              height={25}
              onClick={() => setOpen(!open)}
              style="undefined"
            >
              {!open ? <OpenIcon /> : <CloseIcon />}
            </Button>
          )}

          {renderNavItems({
            navItems,
            open: hover || open,
            showLinkLogo,
            showSections: hover || open,
          })}
        </ul>
        {React.isValidElement(children) &&
          React.cloneElement(
            children as React.ReactElement<{ open?: boolean }>,
            {
              open: open || hover,
            },
          )}
      </div>
    </nav>
  );
};

export default memo(DesktopNavbar);
