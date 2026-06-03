import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { API_ROUTES } from "@/config/apiRoutes";
import {
  clearStoredArtist,
  fetchCurrentArtist,
  readStoredArtist,
  refreshArtistSession,
  writeStoredArtist,
} from "@/Utils/Auth/artistAuthSession";

const okJson = (body: unknown) =>
  ({ ok: true, json: async () => body }) as Response;
const unauthorized = () => ({ ok: false, status: 401 }) as Response;

const ME = {
  id: "ar1",
  email: "artist@example.com",
  stageName: "DJ Test",
  onboardingCompletedAt: null,
};

describe("artistAuthSession", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  it("round-trips the stored identity (write → read → clear)", () => {
    const artist = { id: "ar1", email: "artist@example.com", stageName: "DJ" };
    writeStoredArtist(artist);
    expect(readStoredArtist()).toEqual(artist);
    clearStoredArtist();
    expect(readStoredArtist()).toBeNull();
  });

  it("tolerates a null stage name", () => {
    const artist = { id: "ar2", email: "a@b.c", stageName: null };
    writeStoredArtist(artist);
    expect(readStoredArtist()).toEqual(artist);
  });

  it("refreshArtistSession POSTs to the refresh route with credentials, no body", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(okJson({}));

    await expect(refreshArtistSession()).resolves.toBe(true);
    expect(fetchMock).toHaveBeenCalledWith(API_ROUTES.artistAuthRefresh, {
      method: "POST",
      credentials: "include",
    });
  });

  it("fetchCurrentArtist resolves the identity from /me", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(okJson(ME));
    await expect(fetchCurrentArtist()).resolves.toEqual(ME);
  });

  it("fetchCurrentArtist refreshes once then retries /me on a 401", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(unauthorized())
      .mockResolvedValueOnce(okJson({}))
      .mockResolvedValueOnce(okJson(ME));

    await expect(fetchCurrentArtist()).resolves.toEqual(ME);
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock.mock.calls[1][0]).toBe(API_ROUTES.artistAuthRefresh);
  });
});
