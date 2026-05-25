import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import useAutoRefresh, {
  DEFAULT_REFRESH_INTERVAL_MS,
} from "@/hooks/useAutoRefresh";

/**
 * Forces `document.visibilityState` for a single test and fires the matching
 * `visibilitychange` event, mirroring how a browser reports a tab change.
 */
function setVisibility(state: DocumentVisibilityState): void {
  Object.defineProperty(document, "visibilityState", {
    configurable: true,
    get: () => state,
  });
  document.dispatchEvent(new Event("visibilitychange"));
}

describe("useAutoRefresh", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("calls the callback when the tab becomes visible", () => {
    const onRefresh = vi.fn();
    renderHook(() => useAutoRefresh({ onRefresh }));

    expect(onRefresh).not.toHaveBeenCalled();

    setVisibility("visible");

    expect(onRefresh).toHaveBeenCalledTimes(1);
  });

  it("does not call the callback when the tab becomes hidden", () => {
    const onRefresh = vi.fn();
    renderHook(() => useAutoRefresh({ onRefresh }));

    setVisibility("hidden");

    expect(onRefresh).not.toHaveBeenCalled();
  });

  it("calls the callback on the polling interval while visible", () => {
    const onRefresh = vi.fn();
    setVisibility("visible");
    renderHook(() => useAutoRefresh({ onRefresh, intervalMs: 1000 }));

    // The initial visibility event already triggered one refresh.
    onRefresh.mockClear();

    vi.advanceTimersByTime(3000);

    expect(onRefresh).toHaveBeenCalledTimes(3);
  });

  it("skips polling refreshes while the tab is hidden", () => {
    const onRefresh = vi.fn();
    setVisibility("hidden");
    renderHook(() => useAutoRefresh({ onRefresh, intervalMs: 1000 }));

    vi.advanceTimersByTime(5000);

    expect(onRefresh).not.toHaveBeenCalled();
  });

  it("uses the default interval when none is provided", () => {
    const onRefresh = vi.fn();
    setVisibility("visible");
    renderHook(() => useAutoRefresh({ onRefresh }));
    onRefresh.mockClear();

    vi.advanceTimersByTime(DEFAULT_REFRESH_INTERVAL_MS);

    expect(onRefresh).toHaveBeenCalledTimes(1);
  });

  it("registers nothing when disabled", () => {
    const onRefresh = vi.fn();
    renderHook(() => useAutoRefresh({ onRefresh, enabled: false }));

    setVisibility("visible");
    vi.advanceTimersByTime(DEFAULT_REFRESH_INTERVAL_MS);

    expect(onRefresh).not.toHaveBeenCalled();
  });

  it("cleans up the listener and interval on unmount", () => {
    const onRefresh = vi.fn();
    const { unmount } = renderHook(() =>
      useAutoRefresh({ onRefresh, intervalMs: 1000 }),
    );

    unmount();
    onRefresh.mockClear();

    setVisibility("visible");
    vi.advanceTimersByTime(5000);

    expect(onRefresh).not.toHaveBeenCalled();
  });
});
