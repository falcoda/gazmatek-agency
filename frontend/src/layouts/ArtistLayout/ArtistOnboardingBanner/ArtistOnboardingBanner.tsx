import "./ArtistOnboardingBanner.scss";

import { useTranslation } from "react-i18next";
import { FiAlertCircle } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import { getPagePath } from "@/config/pages";
import { Button } from "@/covaltech-react-ui";
import { useArtistOnboardingStatus } from "@/hooks/useArtistOnboardingStatus";
import { useOptionalLanguage } from "@/hooks/useLanguage";

/**
 * Persistent banner shown across the artist back office while onboarding is
 * incomplete (engagement contract unsigned), with a CTA to resume it so the
 * flow stays discoverable after the invitation. (#34)
 */
const ArtistOnboardingBanner = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const language = useOptionalLanguage();
  const { onboardingComplete } = useArtistOnboardingStatus();

  // Hide while loading (null) or once onboarding is complete.
  if (onboardingComplete !== false) return null;

  return (
    <div className="artistOnboardingBanner" role="status">
      <span className="message">
        <FiAlertCircle className="icon" aria-hidden="true" />
        {t("artistArea.onboarding.bannerMessage")}
      </span>
      <Button
        label={t("artistArea.onboarding.bannerCta")}
        style="blue"
        onClick={() =>
          navigate(getPagePath("artistOnboardingContract", language))
        }
      />
    </div>
  );
};

export default ArtistOnboardingBanner;
