/**
 * Wraps a single-shot token refresh in a singleton promise so that several
 * concurrent requests trigger only one refresh round-trip.
 *
 * @param refreshOnce performs one refresh attempt, resolving to whether it
 *   succeeded.
 * @returns a function returning the in-flight refresh promise, or a new one.
 */
export function createTokenRefresher(
  refreshOnce: () => Promise<boolean>,
): () => Promise<boolean> {
  let pendingRefresh: Promise<boolean> | null = null;

  return function tryRefresh(): Promise<boolean> {
    if (pendingRefresh) {
      return pendingRefresh;
    }

    pendingRefresh = refreshOnce().finally(() => {
      pendingRefresh = null;
    });

    return pendingRefresh;
  };
}
