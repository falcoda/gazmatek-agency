import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { ClientIdentity } from "@/Utils/Auth/clientAuthSession";

const fetchCurrentClient = vi.fn<() => Promise<ClientIdentity | null>>();
const writeStoredClient = vi.fn();
const clearStoredClient = vi.fn();

vi.mock("@/Utils/Auth/clientAuthSession", () => ({
  readStoredClient: () => null,
  writeStoredClient: (c: ClientIdentity) => writeStoredClient(c),
  clearStoredClient: () => clearStoredClient(),
  fetchCurrentClient: () => fetchCurrentClient(),
}));

import { useClientAuthStore } from "@/stores/ClientAuthStore";

const CLIENT: ClientIdentity = { id: "c1", email: null, displayName: null };

describe("ClientAuthStore", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useClientAuthStore.setState({ client: null, isAuthenticated: false });
  });

  afterEach(() => {
    useClientAuthStore.setState({ client: null, isAuthenticated: false });
  });

  it("setClient persists the identity and flips isAuthenticated", () => {
    useClientAuthStore.getState().setClient(CLIENT);
    const state = useClientAuthStore.getState();
    expect(state.client).toEqual(CLIENT);
    expect(state.isAuthenticated).toBe(true);
    expect(writeStoredClient).toHaveBeenCalledWith(CLIENT);
    // The store state must never carry a raw token.
    expect(state).not.toHaveProperty("token");
  });

  it("clear wipes the identity and storage", () => {
    useClientAuthStore.getState().setClient(CLIENT);
    useClientAuthStore.getState().clear();
    expect(useClientAuthStore.getState().client).toBeNull();
    expect(useClientAuthStore.getState().isAuthenticated).toBe(false);
    expect(clearStoredClient).toHaveBeenCalled();
  });

  it("hydrate adopts the identity resolved from /me", async () => {
    fetchCurrentClient.mockResolvedValue(CLIENT);
    await useClientAuthStore.getState().hydrate();
    expect(useClientAuthStore.getState().client).toEqual(CLIENT);
    expect(useClientAuthStore.getState().isAuthenticated).toBe(true);
  });

  it("hydrate clears a stale identity when /me resolves null", async () => {
    useClientAuthStore.setState({ client: CLIENT, isAuthenticated: true });
    fetchCurrentClient.mockResolvedValue(null);
    await useClientAuthStore.getState().hydrate();
    expect(useClientAuthStore.getState().client).toBeNull();
    expect(useClientAuthStore.getState().isAuthenticated).toBe(false);
    expect(clearStoredClient).toHaveBeenCalled();
  });
});
