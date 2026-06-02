import type { TFunction } from "i18next";

import StatusBadge from "@/components/StatusBadge/StatusBadge";
import {
  BOOKING_STATUS_TONE,
  type BookingStatus,
  bookingStatusLabel,
} from "@/config/bookingStatusLabels";
import type { Column } from "@/covaltech-react-ui";
import type { AppLanguage } from "@/i18n/config";
import { formatPriceCents } from "@/Utils/formatPrice";
import { localeFromLang } from "@/Utils/locale";

interface BookingColumnOptions {
  title: string;
  /** Field on the row holding the value (differs between admin/artist DTOs). */
  dataIndex: string;
  /** Mobile display order. */
  order: number;
  sortable?: boolean;
}

/** Localized event date + time column for a bookings table. */
export function eventDateColumn(
  lang: AppLanguage,
  { title, dataIndex, order, sortable = true }: BookingColumnOptions,
): Column {
  return {
    title,
    dataIndex,
    sortable,
    render: (value: string) =>
      new Date(value).toLocaleString(localeFromLang(lang)),
    mobile: { visible: true, order, titleVisible: true },
  };
}

/** Status badge column shared by every bookings table. */
export function bookingStatusColumn(
  t: TFunction,
  { title, dataIndex, order }: BookingColumnOptions,
): Column {
  return {
    title,
    dataIndex,
    render: (value: string) => (
      <StatusBadge
        tone={BOOKING_STATUS_TONE[value as BookingStatus] ?? "neutral"}
      >
        {bookingStatusLabel(t, value)}
      </StatusBadge>
    ),
    mobile: { visible: true, order, titleVisible: true },
  };
}

/** Cents-to-currency total column for a bookings table. */
export function totalCentsColumn(
  lang: AppLanguage,
  { title, dataIndex, order }: BookingColumnOptions,
): Column {
  return {
    title,
    dataIndex,
    render: (value: number) => formatPriceCents(value, lang),
    mobile: { visible: true, order, titleVisible: true },
  };
}
