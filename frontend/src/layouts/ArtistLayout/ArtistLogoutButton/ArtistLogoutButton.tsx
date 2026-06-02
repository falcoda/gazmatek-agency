import "./ArtistLogoutButton.scss";

import { useTranslation } from "react-i18next";
import { FiLogOut } from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";

import { getPagePath } from "@/config/pages";
import type { AppLanguage } from "@/i18n/config";
import { isSupportedLanguage } from "@/i18n/routing";
import { useArtistAuthStore } from "@/stores/ArtistAuthStore";
import { logoutArtist } from "@/Utils/Services/Authenticated/artistAreaApi";

interface ArtistLogoutButtonProps {
  open?: boolean;
  toggleNavbar?: () => void;
}

const ArtistLogoutButton = ({
  open = true,
  toggleNavbar,
}: ArtistLogoutButtonProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { lang } = useParams<{ lang: string }>();
  const language: AppLanguage | undefined = isSupportedLanguage(lang)
    ? lang
    : undefined;
  const clear = useArtistAuthStore((s) => s.clear);
  const refreshToken = useArtistAuthStore((s) => s.refreshToken);

  const handleLogout = async () => {
    // Revoke the server-side refresh token before clearing the local session so
    // a stolen token can't be replayed after sign-out. (#6)
    await logoutArtist(refreshToken);
    clear();
    if (toggleNavbar) toggleNavbar();
    navigate(getPagePath("artistLogin", language));
  };

  return (
    <button
      type="button"
      className="artistLogoutButton"
      onClick={handleLogout}
      aria-label={t("auth.signOut")}
    >
      <FiLogOut className="icon" />
      {open && <span className="label">{t("auth.signOut")}</span>}
    </button>
  );
};

export default ArtistLogoutButton;
