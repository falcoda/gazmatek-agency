import {
  formatZonedDate,
  formatZonedTime,
  getTimeZoneOffsetMs,
  zonedWallClockToInstant,
} from "@src/helpers/timezone";

describe("timezone helpers", () => {
  it("formats an instant in the target timezone", () => {
    const instant = new Date("2026-06-20T20:00:00.000Z");

    expect(formatZonedDate(instant, "Europe/Paris")).toBe("2026-06-20");
    expect(formatZonedTime(instant, "Europe/Paris")).toBe("22:00");
    expect(formatZonedDate(instant, "UTC")).toBe("2026-06-20");
    expect(formatZonedTime(instant, "UTC")).toBe("20:00");
  });

  it("resolves a wall-clock time in a timezone to an absolute instant", () => {
    // 22:00 on 2026-06-20 in Paris (CEST, UTC+2) is 20:00 UTC.
    expect(
      zonedWallClockToInstant(2026, 6, 20, 22, 0, "Europe/Paris").toISOString(),
    ).toBe("2026-06-20T20:00:00.000Z");
    // Winter date (CET, UTC+1).
    expect(
      zonedWallClockToInstant(2026, 1, 10, 22, 0, "Europe/Paris").toISOString(),
    ).toBe("2026-01-10T21:00:00.000Z");
  });

  it("reports the timezone offset at an instant", () => {
    expect(getTimeZoneOffsetMs("UTC", new Date("2026-06-20T12:00:00Z"))).toBe(
      0,
    );
    expect(
      getTimeZoneOffsetMs("Europe/Paris", new Date("2026-06-20T12:00:00Z")),
    ).toBe(2 * 60 * 60 * 1000);
  });
});
