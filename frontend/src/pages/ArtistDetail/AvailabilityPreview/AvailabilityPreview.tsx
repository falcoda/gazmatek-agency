import "./AvailabilityPreview.scss";

import type { EventInput } from "@fullcalendar/core";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import AvailabilityCalendar from "@/components/AvailabilityCalendar/AvailabilityCalendar";
import { buildBookingUrl } from "@/config/pages";
import { useOptionalLanguage } from "@/hooks/useLanguage";
import { fetchAvailability } from "@/Utils/Services/Public/availabilityApi";

interface AvailabilityPreviewProps {
  artistId: string;
  artistSlug: string;
}

const MONTHS_AHEAD = 3;

// FullCalendar event colors cannot read SCSS theme variables (they are applied
// as inline styles in JS), so they are centralized here and kept in sync with
// the theme: $lock-color (busy), $main-orange (partial), $primary-color (text).
const CALENDAR_COLORS = {
  busy: "#d11b1b", // $lock-color
  partial: "#ff8e00", // $main-orange
  eventText: "#0b0b0d", // $primary-color
} as const;

const AvailabilityPreview = ({
  artistId,
  artistSlug,
}: AvailabilityPreviewProps) => {
  const { t } = useTranslation();
  const language = useOptionalLanguage();
  const navigate = useNavigate();
  const [events, setEvents] = useState<EventInput[]>([]);

  useEffect(() => {
    const from = new Date();
    from.setDate(1);
    const to = new Date(from.getFullYear(), from.getMonth() + MONTHS_AHEAD, 1);
    void fetchAvailability(artistId, from.toISOString(), to.toISOString()).then(
      (res) => {
        if (!res) return;
        setEvents(
          res.days
            .filter((day) => day.status !== "free")
            .map((day) => ({
              id: `${artistId}-${day.date}`,
              title:
                day.status === "busy"
                  ? t("availability.unavailable")
                  : t("availability.partial"),
              start: day.date,
              allDay: true,
              backgroundColor:
                day.status === "busy"
                  ? CALENDAR_COLORS.busy
                  : CALENDAR_COLORS.partial,
              borderColor:
                day.status === "busy"
                  ? CALENDAR_COLORS.busy
                  : CALENDAR_COLORS.partial,
              textColor: CALENDAR_COLORS.eventText,
            })),
        );
      },
    );
  }, [artistId, t]);

  return (
    <section
      className="availabilityPreview fi"
      aria-labelledby="availability-title"
    >
      <h2 id="availability-title" className="title">
        {t("artistDetail.availability")}
      </h2>
      <AvailabilityCalendar
        events={events}
        mode="public"
        onSelectEvent={() => {
          // public events are read-only — clicking a busy day starts a booking
          // for the next free slot via the booking flow
          navigate(buildBookingUrl({ artistSlug }, language));
        }}
      />
    </section>
  );
};

export default AvailabilityPreview;
