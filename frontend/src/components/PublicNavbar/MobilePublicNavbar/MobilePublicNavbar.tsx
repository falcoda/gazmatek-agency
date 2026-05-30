import "./MobilePublicNavbar.scss";

import { gsap } from "gsap";
import { memo, type ReactNode, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";

import { Logo } from "@/assets/svg/svgIcons";
import { useOptionalLanguage } from "@/hooks/useLanguage";
import { useClientAuthStore } from "@/stores/ClientAuthStore";

import { getPagePath, PAGES } from "../../../config/pages";
import useNavItems from "../../../hooks/useNavItems";
import { stripLanguagePrefix } from "../../../i18n/routing";

interface MobilePublicNavbarProps {
  mobileLangSwitcher?: ReactNode;
}

const MobilePublicNavbar = ({
  mobileLangSwitcher,
}: MobilePublicNavbarProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const navItems = useNavItems();
  const clientToken = useClientAuthStore((s) => s.token);
  const language = useOptionalLanguage();
  const headerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<HTMLLIElement[]>([]);
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

  const toggleNavbar = () => {
    setIsOpen((current) => !current);
  };

  const handleLogoClick = () => {
    setIsOpen(false);
    navigate(PAGES.main);
  };

  const handleNavClick = (href?: string) => {
    setIsOpen(false);
    if (href) navigate(href);
  };

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("no-scroll");
    } else {
      document.body.classList.remove("no-scroll");
    }
    return () => {
      document.body.classList.remove("no-scroll");
    };
  }, [isOpen]);

  useEffect(() => {
    if (!headerRef.current) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(headerRef.current, { clearProps: "all", opacity: 1 });
      return;
    }

    const context = gsap.context(() => {
      gsap.fromTo(
        headerRef.current,
        { y: -24, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          ease: "power3.out",
          delay: 0.12,
        },
      );
    }, headerRef);

    return () => context.revert();
  }, []);

  useEffect(() => {
    if (!menuRef.current) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reducedMotion) {
      gsap.set(menuRef.current, {
        autoAlpha: isOpen ? 1 : 0,
        pointerEvents: isOpen ? "auto" : "none",
      });
      return;
    }

    const menuItems = itemRefs.current;

    if (isOpen) {
      const timeline = gsap.timeline();
      timeline
        .set(menuRef.current, { pointerEvents: "auto" })
        .fromTo(
          menuRef.current,
          { autoAlpha: 0, clipPath: "inset(0 0 100% 0 round 28px)" },
          {
            autoAlpha: 1,
            clipPath: "inset(0 0 0% 0 round 28px)",
            duration: 0.42,
            ease: "power3.out",
          },
        )
        .fromTo(
          menuItems,
          { y: 24, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.4,
            stagger: 0.06,
            ease: "power3.out",
          },
          "-=0.2",
        );

      return () => {
        timeline.kill();
      };
    }

    gsap.to(menuItems, {
      y: 18,
      opacity: 0,
      duration: 0.18,
      stagger: 0.03,
      overwrite: "auto",
    });

    const closeTween = gsap.to(menuRef.current, {
      autoAlpha: 0,
      clipPath: "inset(0 0 100% 0 round 28px)",
      duration: 0.28,
      ease: "power2.in",
      overwrite: "auto",
      onComplete: () => {
        gsap.set(menuRef.current, { pointerEvents: "none" });
      },
    });

    return () => {
      closeTween.kill();
    };
  }, [isOpen]);

  itemRefs.current = [];

  return (
    <nav
      className="mobilePublicNavbar"
      role="navigation"
      aria-label="Site Navigation"
    >
      <div className="mobileNavbarHeader" ref={headerRef}>
        <button
          type="button"
          className="navbarBrand"
          onClick={handleLogoClick}
          aria-label={t("nav.home")}
        >
          <Logo className="navLogoMobile" />
        </button>
        <button
          className={`burgerBtn ${isOpen ? "open" : ""}`}
          onClick={toggleNavbar}
          type="button"
          aria-label={isOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={isOpen}
        >
          <span className="burgerLine" />
          <span className="burgerLine" />
        </button>
      </div>

      <div className={`mobileMenu ${isOpen ? "open" : ""}`} ref={menuRef}>
        <div className="mobileMenuTopline">
          <span className="menuEyebrow">Gazmatek</span>
        </div>

        <ul className="mobileMenuList">
          {navItems.map((item, index) => {
            const active = isActive(item.href);

            return (
              <li
                key={item.href ?? item.text}
                className="mobileMenuItem"
                ref={(element) => {
                  if (element) {
                    itemRefs.current.push(element);
                  }
                }}
              >
                <button
                  className={`mobileMenuLink ${active ? "active" : ""}`}
                  onClick={() => handleNavClick(item.href ?? item.link)}
                  type="button"
                  aria-current={active ? "page" : undefined}
                >
                  <span className="mobileMenuIndex">
                    {`${index + 1}`.padStart(2, "0")}
                  </span>
                  <span className="mobileMenuText">{item.text}</span>
                  <span className="mobileMenuGlyph">/</span>
                </button>
              </li>
            );
          })}
          <li
            className="mobileMenuItem"
            ref={(element) => {
              if (element) {
                itemRefs.current.push(element);
              }
            }}
          >
            <button
              className={`mobileMenuLink ${
                isActive(
                  clientToken ? PAGES.accountDashboard : PAGES.accountLogin,
                )
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                handleNavClick(
                  getPagePath(
                    clientToken ? "accountDashboard" : "accountLogin",
                    language,
                  ),
                )
              }
              type="button"
            >
              <span className="mobileMenuIndex">
                {`${navItems.length + 1}`.padStart(2, "0")}
              </span>
              <span className="mobileMenuText">
                {clientToken ? t("nav.myArea") : t("nav.login")}
              </span>
              <span className="mobileMenuGlyph">/</span>
            </button>
          </li>
        </ul>

        {mobileLangSwitcher && (
          <div className="mobileMenuFooter">{mobileLangSwitcher}</div>
        )}
      </div>
    </nav>
  );
};

export default memo(MobilePublicNavbar);
