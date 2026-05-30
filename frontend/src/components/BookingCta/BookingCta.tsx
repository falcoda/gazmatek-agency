import "./BookingCta.scss";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { buildBookingUrl } from "@/config/pages";
import { useOptionalLanguage } from "@/hooks/useLanguage";

interface BookingCtaProps {
  artistSlug?: string;
  artistName?: string;
  variant?: "primary" | "sticky" | "secondary";
  className?: string;
  primaryRef?: React.RefObject<HTMLAnchorElement | null>;
}

const STICKY_SCROLL_THRESHOLD_PCT = 0.3;

const BookingCta = ({
  artistSlug,
  artistName,
  variant = "primary",
  className = "",
  primaryRef,
}: BookingCtaProps) => {
  const { t } = useTranslation();
  const language = useOptionalLanguage();
  const [stickyVisible, setStickyVisible] = useState(false);

  useEffect(() => {
    if (variant !== "sticky") return;

    const onScroll = () => {
      const scrolled = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) {
        setStickyVisible(false);
        return;
      }
      const ratio = scrolled / docHeight;
      setStickyVisible(ratio >= STICKY_SCROLL_THRESHOLD_PCT);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [variant]);

  const href = buildBookingUrl({ artistSlug }, language);
  const label = artistName
    ? t("bookingCta.withArtist", { name: artistName })
    : variant === "sticky"
      ? t("bookingCta.sticky")
      : t("bookingCta.primary");
  const aria = artistName
    ? t("bookingCta.withArtistAria", { name: artistName })
    : t("bookingCta.primaryAria");

  if (variant === "sticky") {
    return (
      <Link
        to={href}
        aria-label={aria}
        className={`bookingCta isSticky ${
          stickyVisible ? "isVisible" : ""
        } ${className}`}
      >
        {label}
      </Link>
    );
  }

  return (
    <Link
      ref={primaryRef}
      to={href}
      aria-label={aria}
      className={`bookingCta is${variant.charAt(0).toUpperCase()}${variant.slice(1)} ${className}`}
    >
      {label}
    </Link>
  );
};

export default BookingCta;
