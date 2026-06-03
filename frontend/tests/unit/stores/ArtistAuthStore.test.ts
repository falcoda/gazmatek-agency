import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { ArtistIdentity } from "@/Utils/Auth/artistAuthSession";

const fetchCurrentArtist = vi.fn<() => Promise<ArtistIdentity | null>>();
const writeStoredArtist = vi.fn();
const clearStoredArtist = vi.fn();

vi.mock("@/Utils/Auth/artistAuthSession", () => ({
  readStoredArtist: () => null,
  writeStoredArtist: (a: ArtistIdentity) => writeStoredArtist(a),
  clearStoredArtist: () => clearStoredArtist(),
  fetchCurrentArtist: () => fetchCurrentArtist(),
}));

import { useArtistAuthStore } from "@/stores/ArtistAuthStore";

const ARTIST: ArtistIdentity = {
  id: "ar1",
  email: "artist@example.com",
  stageName: "DJ Test",
};

describe("ArtistAuthStore", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useArtistAuthStore.setState({ artist: null });
  });

  afterEach(() => {
    useArtistAuthStore.setState({ artist: null });
  });

  it("setSession persists the identity without a token", () => {
    useArtistAuthStore.getState().setSession({ artist: ARTIST });
    expect(useArtistAuthStore.getState().artist).toEqual(ARTIST);
    expect(writeStoredArtist).toHaveBeenCalledWith(ARTIST);
    expect(useArtistAuthStore.getState()).not.toHaveProperty("token");
  });

  it("clear wipes the identity and storage", () => {
    useArtistAuthStore.getState().setSession({ artist: ARTIST });
    useArtistAuthStore.getState().clear();
    expect(useArtistAuthStore.getState().artist).toBeNull();
    expect(clearStoredArtist).toHaveBeenCalled();
  });

  it("hydrate adopts the identity resolved from /me", async () => {
    fetchCurrentArtist.mockResolvedValue(ARTIST);
    await useArtistAuthStore.getState().hydrate();
    expect(useArtistAuthStore.getState().artist).toEqual(ARTIST);
  });

  it("hydrate clears a stale identity when /me resolves null", async () => {
    useArtistAuthStore.setState({ artist: ARTIST });
    fetchCurrentArtist.mockResolvedValue(null);
    await useArtistAuthStore.getState().hydrate();
    expect(useArtistAuthStore.getState().artist).toBeNull();
    expect(clearStoredArtist).toHaveBeenCalled();
  });
});
