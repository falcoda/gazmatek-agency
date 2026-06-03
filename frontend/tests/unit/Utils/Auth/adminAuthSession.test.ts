import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { API_ROUTES } from "@/config/apiRoutes";
import {
  clearStoredAdmin,
  fetchCurrentAdmin,
  readStoredAdmin,
  refreshAdminSession,
  writeStoredAdmin,
} from "@/Utils/Auth/adminAuthSession";

const okJson = (body: unknown) =>
  ({ ok: true, json: async () => body }) as Response;
const unauthorized = () => ({ ok: false, status: 401 }) as Response;

const ADMIN = { id: "a1", email: "admin@example.com", fullName: "Admin" };

describe("adminAuthSession", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  it("round-trips the stored identity (write → read → clear)", () => {
    writeStoredAdmin(ADMIN);
    expect(readStoredAdmin()).toEqual(ADMIN);
    clearStoredAdmin();
    expect(readStoredAdmin()).toBeNull();
  });

  it("rejects a malformed stored identity (missing email)", () => {
    window.localStorage.setItem(
      "gazmatek.adminAuth.identity",
      JSON.stringify({ id: "a1" }),
    );
    expect(readStoredAdmin()).toBeNull();
  });

  it("refreshAdminSession POSTs to the refresh route with credentials, no body", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(okJson({}));

    await expect(refreshAdminSession()).resolves.toBe(true);
    expect(fetchMock).toHaveBeenCalledWith(API_ROUTES.adminAuthRefresh, {
      method: "POST",
      credentials: "include",
    });
  });

  it("fetchCurrentAdmin refreshes once then retries /me on a 401", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(unauthorized())
      .mockResolvedValueOnce(okJson({}))
      .mockResolvedValueOnce(okJson(ADMIN));

    await expect(fetchCurrentAdmin()).resolves.toEqual(ADMIN);
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock.mock.calls[0][0]).toBe(API_ROUTES.adminAuthMe);
  });
});
