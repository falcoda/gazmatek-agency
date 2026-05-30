import "./AvailabilityCalendar.scss";

import type { EventInput } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import { useTranslation } from "react-i18next";

import { Card } from "@/covaltech-react-ui";

interface SelectRange {
  start: Date;
  end: Date;
}

interface AvailabilityCalendarProps {
  events: EventInput[];
  mode?: "public" | "artist" | "admin";
  onSelectRange?: (range: SelectRange) => void;
  onSelectEvent?: (eventId: string) => void;
  /** Initial month to show, defaults to today. */
  initialDate?: Date;
}

const AvailabilityCalendar = ({
  events,
  mode = "public",
  onSelectRange,
  onSelectEvent,
  initialDate,
}: AvailabilityCalendarProps) => {
  const { i18n } = useTranslation();
  const locale = i18n.resolvedLanguage?.toLowerCase() ?? "fr";

  const editable = mode !== "public";
  const selectable = editable && Boolean(onSelectRange);
  const initialView = mode === "admin" ? "timeGridWeek" : "dayGridMonth";

  return (
    <Card
      className={`availabilityCalendar is${mode.charAt(0).toUpperCase()}${mode.slice(1)}`}
    >
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView={initialView}
        initialDate={initialDate}
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right:
            mode === "admin"
              ? "dayGridMonth,timeGridWeek,timeGridDay"
              : "dayGridMonth,timeGridWeek",
        }}
        height="auto"
        events={events}
        locale={locale}
        firstDay={1}
        selectable={selectable}
        select={(info) => {
          onSelectRange?.({ start: info.start, end: info.end });
        }}
        eventClick={(info) => {
          if (onSelectEvent && info.event.id) onSelectEvent(info.event.id);
        }}
        nowIndicator
      />
    </Card>
  );
};

export default AvailabilityCalendar;
