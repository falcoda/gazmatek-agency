import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { AdminIdentity } from "@/Utils/Auth/adminAuthSession";

const fetchCurrentAdmin = vi.fn<() => Promise<AdminIdentity | null>>();
const writeStoredAdmin = vi.fn();
const clearStoredAdmin = vi.fn();

vi.mock("@/Utils/Auth/adminAuthSession", () => ({
  readStoredAdmin: () => null,
  writeStoredAdmin: (a: AdminIdentity) => writeStoredAdmin(a),
  clearStoredAdmin: () => clearStoredAdmin(),
  fetchCurrentAdmin: () => fetchCurrentAdmin(),
}));

import { useAdminAuthStore } from "@/stores/AdminAuthStore";

const ADMIN: AdminIdentity = {
  id: "a1",
  email: "admin@example.com",
  fullName: "Admin",
};

describe("AdminAuthStore", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAdminAuthStore.setState({ admin: null });
  });

  afterEach(() => {
    useAdminAuthStore.setState({ admin: null });
  });

  it("setAdmin persists the identity without a token", () => {
    useAdminAuthStore.getState().setAdmin(ADMIN);
    expect(useAdminAuthStore.getState().admin).toEqual(ADMIN);
    expect(writeStoredAdmin).toHaveBeenCalledWith(ADMIN);
    expect(useAdminAuthStore.getState()).not.toHaveProperty("token");
  });

  it("clear wipes the identity and storage", () => {
    useAdminAuthStore.getState().setAdmin(ADMIN);
    useAdminAuthStore.getState().clear();
    expect(useAdminAuthStore.getState().admin).toBeNull();
    expect(clearStoredAdmin).toHaveBeenCalled();
  });

  it("hydrate adopts the identity resolved from /me", async () => {
    fetchCurrentAdmin.mockResolvedValue(ADMIN);
    await useAdminAuthStore.getState().hydrate();
    expect(useAdminAuthStore.getState().admin).toEqual(ADMIN);
  });

  it("hydrate clears a stale identity when /me resolves null", async () => {
    useAdminAuthStore.setState({ admin: ADMIN });
    fetchCurrentAdmin.mockResolvedValue(null);
    await useAdminAuthStore.getState().hydrate();
    expect(useAdminAuthStore.getState().admin).toBeNull();
    expect(clearStoredAdmin).toHaveBeenCalled();
  });
});
