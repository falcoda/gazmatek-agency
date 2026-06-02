import type { TFunction } from "i18next";
import { describe, expect, it } from "vitest";

import {
  BOOKING_STATUSES,
  bookingStatusLabel,
} from "@/config/bookingStatusLabels";

// Minimal `t` stub mirroring i18next: returns a fixed label for known keys and
// echoes the key back when it is missing (as `t` does without a fallback).
const labels: Record<string, string> = {
  "booking.status.pending_validation": "Pending validation",
  "booking.status.confirmed": "Confirmed",
};
const t = ((key: string) => labels[key] ?? key) as unknown as TFunction;

describe("bookingStatusLabel", () => {
  it("resolves a known status to its localized label", () => {
    expect(bookingStatusLabel(t, "confirmed")).toBe("Confirmed");
  });

  it("falls back to the raw status code when the key is missing", () => {
    expect(bookingStatusLabel(t, "some_unmapped_status")).toBe(
      "some_unmapped_status",
    );
  });

  it("covers every canonical booking status", () => {
    expect(BOOKING_STATUSES).toContain("pending_validation");
    expect(BOOKING_STATUSES).toHaveLength(5);
  });
});
