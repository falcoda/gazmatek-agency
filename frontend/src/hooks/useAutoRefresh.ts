import { useEffect, useRef } from "react";

import { loggerService, LogTag } from "@/Utils/LoggerService";

/**
 * Default polling cadence used to keep page data fresh in the background.
 * Kept intentionally light (one minute): it is only a safety net on top of the
 * visibility-based refresh, not a real-time channel.
 */
export const DEFAULT_REFRESH_INTERVAL_MS = 60_000;

interface UseAutoRefreshOptions {
  /**
   * Callback invoked to refresh data in the background. Wrap it in
   * `useCallback` so its identity stays stable across renders.
   */
  onRefresh: () => void | Promise<void>;
  /**
   * Polling cadence in milliseconds. Defaults to
   * {@link DEFAULT_REFRESH_INTERVAL_MS}.
   */
  intervalMs?: number;
  /**
   * When `false`, no event listener and no interval are registered.
   * Defaults to `true`.
   */
  enabled?: boolean;
}

/**
 * Keeps a page's data fresh without a real-time connection:
 *
 *  - refetches whenever the browser tab becomes visible again;
 *  - refetches on a light polling interval while the tab stays visible.
 *
 * Polling is skipped while the tab is hidden to avoid wasted requests. This is
 * a pragmatic stand-in for a true push channel (SSE / WebSocket): it removes
 * the "stale page left open" problem at almost no cost.
 */
const useAutoRefresh = ({
  onRefresh,
  intervalMs = DEFAULT_REFRESH_INTERVAL_MS,
  enabled = true,
}: UseAutoRefreshOptions): void => {
  // Keep the latest callback in a ref so the polling effect never needs to
  // re-subscribe when the consumer passes a new function identity.
  const onRefreshRef = useRef(onRefresh);

  useEffect(() => {
    onRefreshRef.current = onRefresh;
  }, [onRefresh]);

  useEffect(() => {
    if (!enabled) return;

    const runRefresh = () => {
      void onRefreshRef.current();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        loggerService.debug(
          LogTag.HOOK,
          "useAutoRefresh: tab became visible, refreshing data",
        );
        runRefresh();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    const intervalId = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        loggerService.debug(
          LogTag.HOOK,
          "useAutoRefresh: polling interval elapsed, refreshing data",
        );
        runRefresh();
      }
    }, intervalMs);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.clearInterval(intervalId);
    };
  }, [enabled, intervalMs]);
};

export default useAutoRefresh;
