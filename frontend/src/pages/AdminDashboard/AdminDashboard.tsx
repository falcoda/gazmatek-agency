import "@/pages/ArtistDashboard/ArtistDashboard.scss";

import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import SeoHead from "@/components/SeoHead/SeoHead";
import { getPagePath } from "@/config/pages";
import { Button, Card } from "@/covaltech-react-ui";
import { useLanguage } from "@/hooks/useLanguage";
import { useAdminAuthStore } from "@/stores/AdminAuthStore";

const AdminDashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const language = useLanguage();
  const { admin, clear } = useAdminAuthStore();

  const logout = () => {
    clear();
    navigate(getPagePath("adminLogin", language));
  };

  return (
    <div className="artistDashboard">
      <SeoHead
        title={t("admin.dashboard.title")}
        description=""
        path="/admin"
      />
      <header className="header">
        <div>
          <h1>{t("admin.dashboard.title")}</h1>
          <p>{t("admin.dashboard.welcome", { name: admin?.fullName ?? "" })}</p>
        </div>
        <Button label={t("auth.signOut")} style="line" onClick={logout} />
      </header>
      <Card className="panel">
        <div className="adminDashboardLinks">
          <Button
            label={t("admin.nav.artists")}
            style="bordered"
            onClick={() => navigate(getPagePath("adminArtists", language))}
          />
          <Button
            label={t("admin.nav.bookings")}
            style="bordered"
            onClick={() => navigate(getPagePath("adminBookings", language))}
          />
          <Button
            label={t("admin.nav.content")}
            style="bordered"
            onClick={() => navigate(getPagePath("adminContent", language))}
          />
          <Button
            label={t("admin.nav.settings")}
            style="bordered"
            onClick={() => navigate(getPagePath("adminSettings", language))}
          />
        </div>
      </Card>
    </div>
  );
};

export default AdminDashboard;
