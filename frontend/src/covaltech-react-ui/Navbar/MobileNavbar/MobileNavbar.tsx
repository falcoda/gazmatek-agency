import "./MobileNavbar.scss";

import React, {
  type CSSProperties,
  cloneElement,
  isValidElement,
  memo,
  ReactElement,
  useEffect,
  useId,
  useState,
} from "react";
import { NavLink, useLocation } from "react-router-dom";

import { Logo } from "../../../assets/svg/svgIcons";
import useHeaderBannerStore from "../../stores/HeaderBannerStore";
import { NavItemType } from "../Navbar";
import renderNavItems from "../renderNavItems";
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
  const [isOpen, setIsOpen] = useState(false);
  const { visible, height } = useHeaderBannerStore();
  const location = useLocation();
  const collapseId = useId();
  const navbarOffset = visible ? height : 0;

  const closeNavbar = () => {
    setIsOpen(false);
  };

  const toggleNavbar = () => {
    setIsOpen((previouslyOpen) => {
      const nextOpen = !previouslyOpen;

      // Scroll to the main container after closing the menu if requested.
      if (previouslyOpen && !nextOpen && scrollToContainer) {
        const container = document.querySelector(".container");
        if (container) {
          requestAnimationFrame(() => {
            container.scrollIntoView({ behavior: "smooth" });
          });
        }
      }

      return nextOpen;
    });
  };

  useEffect(() => {
    closeNavbar();
  }, [location.pathname]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeNavbar();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const navbarStyle: CSSProperties = {
    marginTop: navbarOffset,
    "--mobile-navbar-offset": `${navbarOffset}px`,
  } as CSSProperties;

  return (
    <nav
      className={`mobileNavbar`}
      role="navigation"
      aria-label="Site Navigation"
      style={navbarStyle}
    >
      <div className="navbar-toggler">
        <NavLink to="/" onClick={closeNavbar}>
          <Logo />
        </NavLink>
        <button
          type="button"
          className="navbar-toggleButton"
          onClick={toggleNavbar}
          aria-expanded={isOpen}
          aria-controls={collapseId}
          aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
        >
          {isOpen ? (
            <BurgerClose className="burger-close-btn" />
          ) : (
            <BurgerOpen className="burger-open-btn" />
          )}
        </button>
      </div>
      <button
        type="button"
        className={`navbar-backdrop ${isOpen ? "show" : ""}`}
        onClick={closeNavbar}
        aria-label="Close navigation menu"
        tabIndex={isOpen ? 0 : -1}
      />
      <div
        id={collapseId}
        className={`navbar-collapse ${isOpen ? "show" : ""}`}
      >
        <ul className="navbar-nav">
          {isValidElement(mobileBeforeChildren) &&
            cloneElement(
              mobileBeforeChildren as ReactElement,
              {
                open: isOpen,
                toggleNavbar: closeNavbar,
              } as any,
            )}

          {renderNavItems({
            navItems,
            showLinkLogo,
            toggleNavbar,
            onLinkClick: toggleNavbar,
          })}
        </ul>
        {/* pass toggleNavbar to children */}
        {isValidElement(children) &&
          cloneElement(children as ReactElement, { toggleNavbar } as any)}
      </div>
    </nav>
  );
};

export default memo(MobileNavbar);
