import "./PublicAvailabilityCalendar.scss";

import type {
  DateSelectArg,
  DatesSetArg,
  DayCellContentArg,
} from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import type { DateClickArg } from "@fullcalendar/interaction";
import interactionPlugin from "@fullcalendar/interaction";
import FullCalendar from "@fullcalendar/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { Card } from "@/covaltech-react-ui";
import {
  type AvailabilityDayStatus,
  fetchAvailability,
} from "@/Utils/Services/Public/availabilityApi";

interface Props {
  artistId: string;
  /** Kept for compatibility — FullCalendar handles its own paging. */
  monthsAhead?: number;
  onDayClick?: (date: string) => void;
}

const DAY_STATUS_CLASS: Record<AvailabilityDayStatus, string | null> = {
  free: null,
  partial: "gz-day-partial",
  busy: "gz-day-busy",
};

function isoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const PublicAvailabilityCalendar = ({ artistId, onDayClick }: Props) => {
  const { i18n, t } = useTranslation();
  const locale = i18n.resolvedLanguage?.toLowerCase() ?? "fr";
  const [statusByDate, setStatusByDate] = useState<
    Record<string, AvailabilityDayStatus>
  >({});
  const loadedRangeRef = useRef<{ from: string; to: string } | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const loadRange = useCallback(
    async (from: Date, to: Date) => {
      const fromIso = from.toISOString();
      const toIso = to.toISOString();
      if (
        loadedRangeRef.current &&
        loadedRangeRef.current.from === fromIso &&
        loadedRangeRef.current.to === toIso
      ) {
        return;
      }
      loadedRangeRef.current = { from: fromIso, to: toIso };
      const res = await fetchAvailability(artistId, fromIso, toIso);
      if (!res) return;
      setStatusByDate((prev) => {
        const next = { ...prev };
        for (const day of res.days) next[day.date] = day.status;
        return next;
      });
    },
    [artistId],
  );

  useEffect(() => {
    loadedRangeRef.current = null;
    setStatusByDate({});
  }, [artistId]);

  // Sync native title tooltips on day cells when availability data changes.
  // FullCalendar's dayCellDidMount only fires on initial mount, so the title
  // needs to be patched imperatively after each statusByDate update.
  useEffect(() => {
    const root = wrapperRef.current;
    if (!root) return;
    const partialLabel = t("availability.partial");
    const busyLabel = t("availability.unavailable");
    const cells = root.querySelectorAll<HTMLElement>(
      ".fc-daygrid-day[data-date]",
    );
    cells.forEach((cell) => {
      const date = cell.dataset.date;
      if (!date) return;
      const status = statusByDate[date];
      if (status === "partial") {
        cell.title = partialLabel;
      } else if (status === "busy") {
        cell.title = busyLabel;
      } else {
        cell.removeAttribute("title");
      }
    });
  }, [statusByDate, t]);

  const dayCellClassNames = useCallback(
    (arg: DayCellContentArg): string[] => {
      const status = statusByDate[isoDate(arg.date)] ?? "free";
      const cls = DAY_STATUS_CLASS[status];
      return cls ? [cls] : [];
    },
    [statusByDate],
  );

  const handleDatesSet = (arg: DatesSetArg) => {
    void loadRange(arg.start, arg.end);
  };

  const handleDateClick = (arg: DateClickArg) => {
    if (!onDayClick) return;
    const status = statusByDate[arg.dateStr] ?? "free";
    if (status === "busy") return;
    onDayClick(arg.dateStr);
  };

  const handleSelect = (arg: DateSelectArg) => {
    if (!onDayClick) return;
    const start = isoDate(arg.start);
    const status = statusByDate[start] ?? "free";
    if (status === "busy") return;
    onDayClick(start);
  };

  return (
    <Card className="publicAvailabilityCalendar" ref={wrapperRef}>
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: "prev,next",
          center: "title",
          right: "today",
        }}
        height="auto"
        aspectRatio={1.1}
        dayCellClassNames={dayCellClassNames}
        locale={locale}
        firstDay={1}
        selectable={Boolean(onDayClick)}
        dateClick={handleDateClick}
        select={handleSelect}
        datesSet={handleDatesSet}
        showNonCurrentDates={false}
        fixedWeekCount={false}
        dayMaxEvents={0}
      />
    </Card>
  );
};

export default PublicAvailabilityCalendar;
