import "./CookieConsent.scss";

import { useEffect, useId, useState } from "react";
import { useTranslation } from "react-i18next";
import { LuChevronDown, LuCookie } from "react-icons/lu";

import { StyledSwitch } from "@/covaltech-react-ui";
import { useCookieConsentStore } from "@/stores/CookieConsentStore";

// Kept in sync with the exit transition duration in CookieConsent.scss.
const EXIT_ANIMATION_MS = 420;

const CookieConsent = () => {
  const { t } = useTranslation();
  const isBannerOpen = useCookieConsentStore((state) => state.isBannerOpen);
  const consent = useCookieConsentStore((state) => state.consent);
  const acceptAll = useCookieConsentStore((state) => state.acceptAll);
  const rejectAll = useCookieConsentStore((state) => state.rejectAll);
  const savePreferences = useCookieConsentStore(
    (state) => state.savePreferences,
  );
  const openBanner = useCookieConsentStore((state) => state.openBanner);

  const [isEntered, setIsEntered] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (!isBannerOpen) {
      return;
    }

    // Pre-fill the toggles with the current decision (relevant when the
    // visitor re-opens the banner to change their mind).
    setAnalytics(consent?.preferences.analytics ?? false);
    setMarketing(consent?.preferences.marketing ?? false);

    // Defer one frame so the entrance transition runs from the initial state.
    const frame = requestAnimationFrame(() => setIsEntered(true));
    return () => cancelAnimationFrame(frame);
  }, [isBannerOpen, consent]);

  // When closed, keep a discreet, always-available way to re-open the banner.
  // GDPR art. 7(3): withdrawing consent must be as easy as giving it.
  if (!isBannerOpen) {
    return (
      <button
        type="button"
        className="cookieReopen"
        onClick={openBanner}
        aria-label={t("cookieConsent.reopen_aria")}
        title={t("cookieConsent.reopen_aria")}
      >
        <LuCookie aria-hidden="true" />
      </button>
    );
  }

  // Play the exit animation, then commit the decision once it has finished.
  const dismissWith = (commit: () => void) => {
    setIsEntered(false);
    window.setTimeout(commit, EXIT_ANIMATION_MS);
  };

  const handleSave = () =>
    dismissWith(() =>
      savePreferences({ necessary: true, analytics, marketing }),
    );

  return (
    <div
      className={`cookieConsent ${isEntered ? "cookieConsent--entered" : ""}`}
      role="dialog"
      aria-modal="false"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      aria-label={t("cookieConsent.aria_label")}
    >
      <div className="cookieConsent__card">
        <div className="cookieConsent__header">
          <span className="cookieConsent__icon" aria-hidden="true">
            <LuCookie />
          </span>
          <div className="cookieConsent__heading">
            <h2 id={titleId} className="cookieConsent__title">
              {t("cookieConsent.title")}
            </h2>
            <p id={descriptionId} className="cookieConsent__text">
              {t("cookieConsent.description")}
            </p>
          </div>
        </div>

        <div
          className={`cookieConsent__details ${
            showDetails ? "cookieConsent__details--open" : ""
          }`}
        >
          <div className="cookieConsent__detailsInner">
            <div className="cookieConsent__category">
              <div className="cookieConsent__categoryInfo">
                <span className="cookieConsent__categoryName">
                  {t("cookieConsent.category_necessary")}
                </span>
                <span className="cookieConsent__categoryDesc">
                  {t("cookieConsent.category_necessary_desc")}
                </span>
              </div>
              <span className="cookieConsent__badge">
                {t("cookieConsent.category_necessary_badge")}
              </span>
            </div>

            <div className="cookieConsent__category">
              <div className="cookieConsent__categoryInfo">
                <span className="cookieConsent__categoryName">
                  {t("cookieConsent.category_analytics")}
                </span>
                <span className="cookieConsent__categoryDesc">
                  {t("cookieConsent.category_analytics_desc")}
                </span>
              </div>
              <StyledSwitch
                checked={analytics}
                onChange={(event) => setAnalytics(event.target.checked)}
              />
            </div>

            <div className="cookieConsent__category">
              <div className="cookieConsent__categoryInfo">
                <span className="cookieConsent__categoryName">
                  {t("cookieConsent.category_marketing")}
                </span>
                <span className="cookieConsent__categoryDesc">
                  {t("cookieConsent.category_marketing_desc")}
                </span>
              </div>
              <StyledSwitch
                checked={marketing}
                onChange={(event) => setMarketing(event.target.checked)}
              />
            </div>
          </div>
        </div>

        <div className="cookieConsent__actions">
          <button
            type="button"
            className={`cookieConsent__customize ${
              showDetails ? "cookieConsent__customize--open" : ""
            }`}
            onClick={() => setShowDetails((value) => !value)}
            aria-expanded={showDetails}
          >
            {t("cookieConsent.customize")}
            <LuChevronDown aria-hidden="true" />
          </button>

          <div className="cookieConsent__buttons">
            <button
              type="button"
              className="cookieConsent__btn"
              onClick={() => dismissWith(rejectAll)}
            >
              {t("cookieConsent.reject_all")}
            </button>
            {showDetails ? (
              <button
                type="button"
                className="cookieConsent__btn"
                onClick={handleSave}
              >
                {t("cookieConsent.save")}
              </button>
            ) : (
              <button
                type="button"
                className="cookieConsent__btn"
                onClick={() => dismissWith(acceptAll)}
              >
                {t("cookieConsent.accept_all")}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
