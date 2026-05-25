import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AUTH_STORAGE_KEYS } from "@/Utils/Auth/authConstants";
import type { AuthSession } from "@/Utils/Auth/authSession";
import {
  clearAuthSession,
  readAuthSession,
  refreshSession,
  writeAuthSession,
} from "@/Utils/Auth/authSession";

const STORAGE_KEY = AUTH_STORAGE_KEYS.USER_SESSION;

const validSession: AuthSession = {
  accessToken: "access-token",
  refreshToken: "refresh-token",
  user: { id: 1, email: "user@example.com" },
};

describe("authSession storage helpers", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  it("writes a session as JSON under the auth storage key", () => {
    writeAuthSession(validSession);

    expect(window.localStorage.getItem(STORAGE_KEY)).toBe(
      JSON.stringify(validSession),
    );
  });

  it("reads back a previously written session", () => {
    writeAuthSession(validSession);

    expect(readAuthSession()).toEqual(validSession);
  });

  it("returns null when no session is stored", () => {
    expect(readAuthSession()).toBeNull();
  });

  it("returns null when the stored session is missing required fields", () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ accessToken: "only-access" }),
    );

    expect(readAuthSession()).toBeNull();
  });

  it("returns null and clears storage when the stored value is invalid JSON", () => {
    window.localStorage.setItem(STORAGE_KEY, "{ not json");

    expect(readAuthSession()).toBeNull();
    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it("removes the persisted session on clear", () => {
    writeAuthSession(validSession);
    clearAuthSession();

    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull();
    expect(readAuthSession()).toBeNull();
  });
});

describe("refreshSession", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("posts the refresh token to the backend refresh endpoint", async () => {
    const tokens = {
      accessToken: "new-access",
      refreshToken: "new-refresh",
    };
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => tokens,
    } as Response);
    vi.stubGlobal("fetch", fetchMock);

    const result = await refreshSession("old-refresh");

    expect(result).toEqual(tokens);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/auth/refresh");
    expect(init).toMatchObject({ method: "POST" });
    expect(JSON.parse(init.body as string)).toEqual({
      refreshToken: "old-refresh",
    });
  });

  it("returns null when the refresh request fails with a non-ok status", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false } as Response),
    );

    expect(await refreshSession("old-refresh")).toBeNull();
  });

  it("returns null when the network request throws", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("network down")),
    );

    expect(await refreshSession("old-refresh")).toBeNull();
  });
});
