import "@/pages/ArtistDashboard/ArtistDashboard.scss";

import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";

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
} from "@/Utils/Services/Authenticated/artistAreaApi";

const ArtistBookings = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const language = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get("tab") === "past" ? "past" : "upcoming";
  const artist = useArtistAuthStore((s) => s.artist);
  const [bookings, setBookings] = useState<ArtistBookingDto[]>([]);

  useEffect(() => {
    if (!artist) return;
    void fetchArtistBookings(tab).then((res) => {
      setBookings(res?.data ?? []);
    });
  }, [artist, tab]);

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

  const handleRowClick = (record: ArtistBookingDto) => {
    navigate(`${getPagePath("artistBookings", language)}/${record.id}`);
  };

  return (
    <div className="artistDashboard">
      <SeoHead
        title={t("artistArea.bookings.title")}
        description=""
        path="/artist/bookings"
      />
      <header className="header">
        <h1>{t("artistArea.bookings.title")}</h1>
        <div className="actions">
          <Button
            label={t("artistArea.bookings.upcoming")}
            style={tab === "upcoming" ? "blue" : "line"}
            onClick={() => setSearchParams({ tab: "upcoming" })}
          />
          <Button
            label={t("artistArea.bookings.past")}
            style={tab === "past" ? "blue" : "line"}
            onClick={() => setSearchParams({ tab: "past" })}
          />
        </div>
      </header>
      <Card className="panel">
        <DynamicTable
          data={bookings}
          columns={columns}
          pagined
          mobile
          onClick={handleRowClick}
          tableId={`artist-bookings-${tab}`}
        />
      </Card>
    </div>
  );
};

export default ArtistBookings;
