import "./PublicLayout.scss";

import { useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";
import { Outlet, useParams } from "react-router-dom";

import CookieConsent from "@/components/CookieConsent/CookieConsent";
import CustomCursor from "@/components/CustomCursor/CustomCursor";
import Footer from "@/components/Footer/Footer";
import LanguageSwitcher from "@/components/LanguageSwitcher/LanguageSwitcher";
import PublicNavbar from "@/components/PublicNavbar/PublicNavbar";
import SeoHead from "@/components/SeoHead/SeoHead";
import { isSupportedLanguage } from "@/i18n/routing";

interface PublicLayoutProps {
  /** Pass through the lang switcher even when the route is mono-language. */
  forceLangSwitcher?: boolean;
}

const SCROLL_THRESHOLD = 20;

const PublicLayout = ({ forceLangSwitcher = false }: PublicLayoutProps) => {
  const { lang } = useParams<{ lang: string }>();
  const showLangSwitcher = forceLangSwitcher || isSupportedLanguage(lang);
  const [scrolled, setScrolled] = useState(false);

  // The page scrolls on `window` (the layout no longer creates its own scroll
  // container) so GSAP ScrollTrigger and components that read `window.scrollY`
  // (e.g. the sticky BookingCta) both work without extra wiring.
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > SCROLL_THRESHOLD);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className={`publicLayout ${scrolled ? "isScrolled" : ""}`}>
      <SeoHead />
      <CustomCursor />
      <PublicNavbar
        langSwitcher={showLangSwitcher ? <LanguageSwitcher /> : undefined}
        mobileLangSwitcher={
          showLangSwitcher ? <LanguageSwitcher mobile /> : undefined
        }
      />
      <main className="main">
        <Outlet />
      </main>
      <Footer />
      <CookieConsent />
      <Toaster
        position="bottom-right"
        reverseOrder={false}
        toastOptions={{
          style: {
            fontFamily:
              '"Inter", system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
            fontSize: 14,
            fontWeight: 500,
          },
        }}
      />
    </div>
  );
};

export default PublicLayout;
