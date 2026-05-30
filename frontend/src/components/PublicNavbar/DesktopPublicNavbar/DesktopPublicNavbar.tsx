import "./DesktopPublicNavbar.scss";

import { gsap } from "gsap";
import { memo, type ReactNode, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";

import { Logo } from "@/assets/svg/svgIcons";
import { useOptionalLanguage } from "@/hooks/useLanguage";
import { useClientAuthStore } from "@/stores/ClientAuthStore";

import { getPagePath, PAGES } from "../../../config/pages";
import useNavItems from "../../../hooks/useNavItems";
import { stripLanguagePrefix } from "../../../i18n/routing";

interface DesktopPublicNavbarProps {
  langSwitcher?: ReactNode;
}

const DesktopPublicNavbar = ({ langSwitcher }: DesktopPublicNavbarProps) => {
  const navbarRef = useRef<HTMLElement>(null);
  const navItemRefs = useRef<HTMLLIElement[]>([]);
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const navItems = useNavItems();
  const clientToken = useClientAuthStore((s) => s.token);
  const language = useOptionalLanguage();
  const currentPath = stripLanguagePrefix(location.pathname);

  const isActive = (href?: string) => {
    if (!href) return false;
    const targetPath = stripLanguagePrefix(href);
    if (targetPath === "/") {
      return currentPath === "/";
    }
    return (
      currentPath === targetPath || currentPath.startsWith(`${targetPath}/`)
    );
  };

  const handleLogoClick = () => {
    navigate(PAGES.main);
  };

  const handleNavClick = (href?: string) => {
    if (href) navigate(href);
  };

  useEffect(() => {
    if (!navbarRef.current) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set([navbarRef.current, ...navItemRefs.current], {
        clearProps: "all",
        opacity: 1,
      });
      return;
    }

    const context = gsap.context(() => {
      gsap.fromTo(
        navbarRef.current,
        { y: -28, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.72,
          ease: "power3.out",
          delay: 0.12,
        },
      );

      gsap.fromTo(
        navItemRefs.current,
        { y: -18, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.52,
          stagger: 0.055,
          ease: "power3.out",
          delay: 0.24,
        },
      );
    }, navbarRef);

    return () => context.revert();
  }, []);

  navItemRefs.current = [];

  return (
    <nav
      className="desktopPublicNavbar"
      role="navigation"
      aria-label="Site Navigation"
      ref={navbarRef}
    >
      <div className="navPanel">
        <button
          type="button"
          className="navbarLogo"
          onClick={handleLogoClick}
          aria-label={t("nav.home")}
        >
          <Logo className="navLogoIcon" />
        </button>

        <ul className="navbarLinks">
          {navItems.map((item, index) => {
            const active = isActive(item.href);

            return (
              <li
                key={item.href ?? item.text}
                className="navItem"
                ref={(element) => {
                  if (element) {
                    navItemRefs.current.push(element);
                  }
                }}
              >
                <button
                  className={`navLink ${active ? "active" : ""}`}
                  onClick={() => handleNavClick(item.href ?? item.link)}
                  type="button"
                  aria-current={active ? "page" : undefined}
                >
                  <span className="navIndex">
                    {`${index + 1}`.padStart(2, "0")}
                  </span>
                  <span className="navLinkText">{item.text}</span>
                  <span className="navLinkAccent" />
                </button>
              </li>
            );
          })}
          <li
            className="navItem authItem"
            ref={(element) => {
              if (element) {
                navItemRefs.current.push(element);
              }
            }}
          >
            <button
              className={`navLink ${
                isActive(
                  clientToken ? PAGES.accountDashboard : PAGES.accountLogin,
                )
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                navigate(
                  getPagePath(
                    clientToken ? "accountDashboard" : "accountLogin",
                    language,
                  ),
                )
              }
              type="button"
            >
              <span className="navIndex">
                {`${navItems.length + 1}`.padStart(2, "0")}
              </span>
              <span className="navLinkText">
                {clientToken ? t("nav.myArea") : t("nav.login")}
              </span>
              <span className="navLinkAccent" />
            </button>
          </li>
        </ul>

        {langSwitcher && <div className="navbarTools">{langSwitcher}</div>}
      </div>
    </nav>
  );
};

export default memo(DesktopPublicNavbar);
