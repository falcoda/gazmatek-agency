import "./AdminLogoutButton.scss";

import { useTranslation } from "react-i18next";
import { FiLogOut } from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";

import { getPagePath } from "@/config/pages";
import type { AppLanguage } from "@/i18n/config";
import { isSupportedLanguage } from "@/i18n/routing";
import { useAdminAuthStore } from "@/stores/AdminAuthStore";

interface AdminLogoutButtonProps {
  open?: boolean;
  toggleNavbar?: () => void;
}

const AdminLogoutButton = ({
  open = true,
  toggleNavbar,
}: AdminLogoutButtonProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { lang } = useParams<{ lang: string }>();
  const language: AppLanguage | undefined = isSupportedLanguage(lang)
    ? lang
    : undefined;
  const clear = useAdminAuthStore((s) => s.clear);

  const handleLogout = () => {
    clear();
    if (toggleNavbar) toggleNavbar();
    navigate(getPagePath("adminLogin", language));
  };

  return (
    <button
      type="button"
      className="adminLogoutButton"
      onClick={handleLogout}
      aria-label={t("auth.signOut")}
    >
      <FiLogOut className="icon" />
      {open && <span className="label">{t("auth.signOut")}</span>}
    </button>
  );
};

export default AdminLogoutButton;
