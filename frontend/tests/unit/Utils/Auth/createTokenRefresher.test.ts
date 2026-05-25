import { describe, expect, it, vi } from "vitest";

import { createTokenRefresher } from "@/Utils/Auth/createTokenRefresher";

/** Resolves a promise that the test controls manually. */
function deferred<T>(): {
  promise: Promise<T>;
  resolve: (value: T) => void;
} {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((res) => {
    resolve = res;
  });
  return { promise, resolve };
}

describe("createTokenRefresher", () => {
  it("de-duplicates concurrent refresh calls into a single round-trip", async () => {
    const gate = deferred<boolean>();
    const refreshOnce = vi.fn(() => gate.promise);

    const tryRefresh = createTokenRefresher(refreshOnce);

    const first = tryRefresh();
    const second = tryRefresh();
    const third = tryRefresh();

    // All concurrent callers share the same in-flight promise.
    expect(first).toBe(second);
    expect(second).toBe(third);
    expect(refreshOnce).toHaveBeenCalledTimes(1);

    gate.resolve(true);

    expect(await first).toBe(true);
    expect(await second).toBe(true);
    expect(await third).toBe(true);
  });

  it("starts a fresh refresh once the previous one has settled", async () => {
    const refreshOnce = vi
      .fn<() => Promise<boolean>>()
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(false);

    const tryRefresh = createTokenRefresher(refreshOnce);

    expect(await tryRefresh()).toBe(true);
    expect(await tryRefresh()).toBe(false);
    expect(refreshOnce).toHaveBeenCalledTimes(2);
  });

  it("clears the in-flight guard even when the refresh rejects", async () => {
    const refreshOnce = vi
      .fn<() => Promise<boolean>>()
      .mockRejectedValueOnce(new Error("network down"))
      .mockResolvedValueOnce(true);

    const tryRefresh = createTokenRefresher(refreshOnce);

    await expect(tryRefresh()).rejects.toThrow("network down");

    // The guard reset means a subsequent call triggers a new attempt.
    expect(await tryRefresh()).toBe(true);
    expect(refreshOnce).toHaveBeenCalledTimes(2);
  });
});
