import "./ArtistDashboard.scss";

import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import SeoHead from "@/components/SeoHead/SeoHead";
import { getPagePath } from "@/config/pages";
import { Button, Card, type Column, DynamicTable } from "@/covaltech-react-ui";
import { useLanguage } from "@/hooks/useLanguage";
import { useArtistAuthStore } from "@/stores/ArtistAuthStore";
import {
  bookingStatusColumn,
  eventDateColumn,
  totalCentsColumn,
} from "@/Utils/bookingColumns";
import {
  type ArtistBookingDto,
  fetchArtistBookings,
  logoutArtist,
} from "@/Utils/Services/Authenticated/artistAreaApi";

const UPCOMING_LIMIT = 5;

const ArtistDashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const language = useLanguage();
  const { token, refreshToken, artist, clear } = useArtistAuthStore();
  const [bookings, setBookings] = useState<ArtistBookingDto[]>([]);

  useEffect(() => {
    if (!token) return;
    void fetchArtistBookings("upcoming").then((res) => {
      if (res) setBookings(res.data);
    });
  }, [token]);

  const logout = async () => {
    // Revoke the refresh token server-side before clearing locally. (#6)
    await logoutArtist(refreshToken);
    clear();
    navigate(getPagePath("artistLogin", language));
  };

  const columns: Column[] = useMemo(
    () => [
      eventDateColumn(language, {
        title: t("admin.bookings.col.date"),
        dataIndex: "eventDate",
        order: 0,
      }),
      {
        title: t("artistArea.col.location"),
        dataIndex: "eventLocation",
        mobile: { visible: true, order: 1, titleVisible: true },
      },
      {
        title: t("artistArea.col.client"),
        dataIndex: "clientName",
        mobile: { visible: true, order: 2, titleVisible: true },
      },
      bookingStatusColumn(t, {
        title: t("admin.bookings.col.status"),
        dataIndex: "status",
        order: 3,
      }),
      totalCentsColumn(language, {
        title: t("admin.bookings.col.total"),
        dataIndex: "quotedTotalCents",
        order: 4,
      }),
    ],
    [t, language],
  );

  const visibleBookings = bookings.slice(0, UPCOMING_LIMIT);

  const handleRowClick = (record: ArtistBookingDto) => {
    navigate(`${getPagePath("artistBookings", language)}/${record.id}`);
  };

  return (
    <div className="artistDashboard">
      <SeoHead
        title={t("artistArea.dashboard.title")}
        description=""
        path="/artist"
      />
      <header className="header">
        <div>
          <h1>{t("artistArea.dashboard.title")}</h1>
          <p>
            {t("artistArea.dashboard.welcome", {
              name: artist?.stageName ?? "",
            })}
          </p>
        </div>
        <div className="actions">
          <Button
            label={t("artistArea.nav.calendar")}
            style="line"
            onClick={() => navigate(getPagePath("artistCalendar", language))}
          />
          <Button
            label={t("artistArea.nav.allBookings")}
            style="line"
            onClick={() => navigate(getPagePath("artistBookings", language))}
          />
          <Button label={t("auth.signOut")} style="danger" onClick={logout} />
        </div>
      </header>

      <Card className="panel">
        <h2>{t("artistArea.upcoming.title")}</h2>
        <DynamicTable
          data={visibleBookings}
          columns={columns}
          mobile
          onClick={handleRowClick}
          tableId="artist-dashboard-upcoming"
        />
      </Card>
    </div>
  );
};

export default ArtistDashboard;
