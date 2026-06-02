import { listPublicBusyBookings } from "@src/db/query/booking/listPublicBusyBookings.types";
import { listUnavailabilitiesInRange } from "@src/db/query/unavailability/listUnavailabilitiesInRange.types";
import { config } from "@src/helpers/config/config";
import { ValidationError } from "@src/helpers/error/errors";
import {
  formatZonedDate,
  zonedWallClockToInstant,
} from "@src/helpers/timezone";
import { Pool } from "pg";

export type AvailabilityDayStatus = "free" | "partial" | "busy";

export interface AvailabilityDay {
  date: string; // YYYY-MM-DD
  status: AvailabilityDayStatus;
}

export interface AvailabilityResponse {
  days: AvailabilityDay[];
}

const MAX_RANGE_DAYS = 366;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

export class AvailabilityService {
  constructor(private db: Pool) {}

  async getPublic(input: {
    artistId: string;
    from: string;
    to: string;
  }): Promise<AvailabilityResponse> {
    const fromDate = new Date(input.from);
    const toDate = new Date(input.to);

    if (
      Number.isNaN(fromDate.getTime()) ||
      Number.isNaN(toDate.getTime()) ||
      toDate.getTime() <= fromDate.getTime()
    ) {
      throw new ValidationError("Invalid availability date range");
    }
    const days = Math.ceil(
      (toDate.getTime() - fromDate.getTime()) / MS_PER_DAY,
    );
    if (days > MAX_RANGE_DAYS) {
      throw new ValidationError("Date range exceeds 366 days");
    }

    const [bookingRows, unavailRows] = await Promise.all([
      // #17 — the public calendar must not disclose pending requests, so it uses
      // the narrower confirmed + awaiting_deposit query, not the broad internal
      // conflict guard.
      listPublicBusyBookings.run(
        {
          artistId: input.artistId,
          rangeStart: fromDate,
          rangeEnd: toDate,
        },
        this.db,
      ),
      listUnavailabilitiesInRange.run(
        {
          artistId: input.artistId,
          rangeStart: fromDate,
          rangeEnd: toDate,
        },
        this.db,
      ),
    ]);

    // #44 — a day that overlaps ANY confirmed booking is busy, not partial: an
    // evening gig spanning midnight must mark both affected days busy. We track
    // booking-occupied days as a hard "busy" override regardless of how many
    // hours the overlap covers, and keep the duration-based overlap only to
    // distinguish "partial" (unavailability blocks) from "free".
    const bookingIntervals: Array<[number, number]> = [];
    for (const b of bookingRows) {
      const start = b.event_date.getTime();
      const end = start + Number(b.event_duration_hours) * 60 * 60 * 1000;
      bookingIntervals.push([start, end]);
    }
    const busyIntervals: Array<[number, number]> = [];
    for (const u of unavailRows) {
      busyIntervals.push([u.starts_at.getTime(), u.ends_at.getTime()]);
    }

    const tz = config.app.timezone;
    const result: AvailabilityDay[] = [];

    const firstYmd = formatZonedDate(fromDate, tz);
    let [year, month, day] = firstYmd.split("-").map(Number);

    while (true) {
      const dayStart = zonedWallClockToInstant(year, month, day, 0, 0, tz);
      if (dayStart.getTime() >= toDate.getTime()) break;

      const next = new Date(Date.UTC(year, month - 1, day + 1));
      const nextYear = next.getUTCFullYear();
      const nextMonth = next.getUTCMonth() + 1;
      const nextDay = next.getUTCDate();
      const dayEnd = zonedWallClockToInstant(
        nextYear,
        nextMonth,
        nextDay,
        0,
        0,
        tz,
      );

      const dayStartMs = dayStart.getTime();
      const dayEndMs = dayEnd.getTime();
      const dayLengthMs = dayEndMs - dayStartMs;

      // Any confirmed/awaiting booking overlapping the day makes it busy (#44).
      const hasBooking = bookingIntervals.some(
        ([s, e]) => Math.min(e, dayEndMs) > Math.max(s, dayStartMs),
      );

      // Unavailability windows still use the duration heuristic: a full-day
      // block is busy, a partial block is partial.
      let unavailOverlap = 0;
      for (const [s, e] of busyIntervals) {
        const intersectStart = Math.max(s, dayStartMs);
        const intersectEnd = Math.min(e, dayEndMs);
        if (intersectEnd > intersectStart) {
          unavailOverlap += intersectEnd - intersectStart;
        }
      }

      let status: AvailabilityDayStatus = "free";
      if (hasBooking || unavailOverlap >= dayLengthMs) {
        status = "busy";
      } else if (unavailOverlap > 0) {
        status = "partial";
      }

      result.push({
        date: `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
        status,
      });

      year = nextYear;
      month = nextMonth;
      day = nextDay;
    }

    return { days: result };
  }
}

export default AvailabilityService;
