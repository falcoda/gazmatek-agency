import { describe, expect, it } from "vitest";

import {
  computeRemainingCents,
  MIN_BOOKING_LEAD_HOURS,
  minBookingDateTimeLocal,
} from "@/Utils/booking";

describe("computeRemainingCents", () => {
  it("subtracts the deposit from the total", () => {
    expect(computeRemainingCents(10000, 3000)).toBe(7000);
  });

  it("never returns a negative balance", () => {
    expect(computeRemainingCents(1000, 5000)).toBe(0);
  });
});

describe("minBookingDateTimeLocal", () => {
  it("returns the lead-time offset as a local datetime-local string", () => {
    const now = new Date(2026, 0, 1, 12, 0); // 1 Jan 2026, 12:00 local
    // +48h => 3 Jan 2026, 12:00 local
    expect(minBookingDateTimeLocal(MIN_BOOKING_LEAD_HOURS, now)).toBe(
      "2026-01-03T12:00",
    );
  });

  it("honours a custom lead time", () => {
    const now = new Date(2026, 0, 1, 0, 0);
    expect(minBookingDateTimeLocal(2, now)).toBe("2026-01-01T02:00");
  });
});
