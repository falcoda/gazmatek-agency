import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { API_ROUTES } from "@/config/apiRoutes";
import {
  clearStoredClient,
  fetchCurrentClient,
  readStoredClient,
  refreshClientSession,
  writeStoredClient,
} from "@/Utils/Auth/clientAuthSession";

const okJson = (body: unknown) =>
  ({ ok: true, json: async () => body }) as Response;
const unauthorized = () => ({ ok: false, status: 401 }) as Response;

describe("clientAuthSession", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  it("round-trips the stored identity (write → read → clear)", () => {
    const client = { id: "c1", email: "c@example.com", displayName: "C" };
    writeStoredClient(client);
    expect(readStoredClient()).toEqual(client);
    clearStoredClient();
    expect(readStoredClient()).toBeNull();
  });

  it("accepts a client with a null email and display name (stub account)", () => {
    const stub = { id: "c2", email: null, displayName: null };
    writeStoredClient(stub);
    expect(readStoredClient()).toEqual(stub);
  });

  it("never persists a token in storage", () => {
    writeStoredClient({ id: "c3", email: "x@y.z", displayName: null });
    const raw = window.localStorage.getItem("gazmatek.clientAuth.identity");
    expect(raw).not.toContain("token");
  });

  it("refreshClientSession POSTs to the refresh route with credentials and no body", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(okJson({}));

    await expect(refreshClientSession()).resolves.toBe(true);

    expect(fetchMock).toHaveBeenCalledWith(API_ROUTES.accountRefresh, {
      method: "POST",
      credentials: "include",
    });
    const init = fetchMock.mock.calls[0][1] as RequestInit;
    expect(init.body).toBeUndefined();
  });

  it("fetchCurrentClient resolves the identity from /me", async () => {
    const client = { id: "c4", email: "c@example.com", displayName: "C" };
    vi.spyOn(globalThis, "fetch").mockResolvedValue(okJson(client));

    await expect(fetchCurrentClient()).resolves.toEqual(client);
  });

  it("fetchCurrentClient refreshes once then retries /me on a 401", async () => {
    const client = { id: "c5", email: null, displayName: null };
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(unauthorized()) // first /me
      .mockResolvedValueOnce(okJson({})) // refresh
      .mockResolvedValueOnce(okJson(client)); // retry /me

    await expect(fetchCurrentClient()).resolves.toEqual(client);
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock.mock.calls[1][0]).toBe(API_ROUTES.accountRefresh);
  });

  it("fetchCurrentClient returns null when the refresh also fails", async () => {
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(unauthorized()) // /me
      .mockResolvedValueOnce(unauthorized()); // refresh

    await expect(fetchCurrentClient()).resolves.toBeNull();
  });
});
