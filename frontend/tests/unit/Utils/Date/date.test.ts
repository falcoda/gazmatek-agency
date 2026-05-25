import { describe, expect, it } from "vitest";

import {
  addDaysToDate,
  formatDateInputValue,
  formatDisplayDate,
  formatDisplayTime,
  formatTimeInputValue,
  getCalendarDaySpan,
  getFullDayRange,
  normalizeDateValue,
  parseDateInputValue,
  setTimeOnDate,
} from "@/Utils/Date/date";

describe("normalizeDateValue", () => {
  it("parses a YYYY-MM-DD string anchored at midday local time", () => {
    const date = normalizeDateValue("2026-05-22");

    expect(date.getFullYear()).toBe(2026);
    expect(date.getMonth()).toBe(4);
    expect(date.getDate()).toBe(22);
    expect(date.getHours()).toBe(12);
  });

  it("normalizes a Date instance to midday", () => {
    const date = normalizeDateValue(new Date(2026, 0, 1, 23, 30));

    expect(date.getHours()).toBe(12);
    expect(date.getDate()).toBe(1);
  });
});

describe("formatDateInputValue", () => {
  it("serializes a date to the input[type=date] format", () => {
    expect(formatDateInputValue(new Date(2026, 4, 9))).toBe("2026-05-09");
  });
});

describe("parseDateInputValue", () => {
  it("parses an input[type=date] value into a Date", () => {
    const date = parseDateInputValue("2026-12-31");

    expect(date.getFullYear()).toBe(2026);
    expect(date.getMonth()).toBe(11);
    expect(date.getDate()).toBe(31);
  });
});

describe("addDaysToDate", () => {
  it("adds days, crossing month boundaries", () => {
    expect(formatDateInputValue(addDaysToDate("2026-05-30", 3))).toBe(
      "2026-06-02",
    );
  });

  it("subtracts days with a negative offset", () => {
    expect(formatDateInputValue(addDaysToDate("2026-05-02", -5))).toBe(
      "2026-04-27",
    );
  });
});

describe("getCalendarDaySpan", () => {
  it("returns the whole-day span between two dates", () => {
    expect(getCalendarDaySpan(new Date(2026, 4, 1), new Date(2026, 4, 6))).toBe(
      5,
    );
  });

  it("never returns a negative span", () => {
    expect(getCalendarDaySpan(new Date(2026, 4, 6), new Date(2026, 4, 1))).toBe(
      0,
    );
  });
});

describe("formatDisplayDate", () => {
  it("formats a date with an explicit locale", () => {
    expect(formatDisplayDate("2026-01-05", "en-GB")).toBe("05 Jan 2026");
  });
});

describe("getFullDayRange", () => {
  it("returns start-of-day and end-of-day boundaries", () => {
    const { start, end } = getFullDayRange("2026-05-22", "2026-05-24");

    expect(start.getHours()).toBe(0);
    expect(start.getMinutes()).toBe(0);
    expect(start.getDate()).toBe(22);
    expect(end.getHours()).toBe(23);
    expect(end.getMinutes()).toBe(59);
    expect(end.getDate()).toBe(24);
  });
});

describe("setTimeOnDate", () => {
  it("applies a HH:mm time onto a date", () => {
    const date = setTimeOnDate("2026-05-22", "14:30");

    expect(date.getHours()).toBe(14);
    expect(date.getMinutes()).toBe(30);
    expect(date.getDate()).toBe(22);
  });

  it("shifts the date by the given day offset", () => {
    const date = setTimeOnDate("2026-05-22", "01:00", 1);

    expect(date.getDate()).toBe(23);
    expect(date.getHours()).toBe(1);
  });

  it("falls back to zero for invalid time parts", () => {
    const date = setTimeOnDate("2026-05-22", "not-a-time");

    expect(date.getHours()).toBe(0);
    expect(date.getMinutes()).toBe(0);
  });
});

describe("formatTimeInputValue", () => {
  it("serializes a date to the input[type=time] format", () => {
    expect(formatTimeInputValue(new Date(2026, 4, 22, 9, 5))).toBe("09:05");
  });
});

describe("formatDisplayTime", () => {
  it("formats a time with an explicit locale", () => {
    expect(formatDisplayTime(new Date(2026, 4, 22, 14, 30), "en-GB")).toBe(
      "14:30",
    );
  });
});
