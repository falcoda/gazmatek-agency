import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { TOKEN_EXPIRY_LEEWAY_SECONDS } from "@/Utils/Auth/authConstants";
import { isAccessTokenExpired } from "@/Utils/Auth/jwt";

/**
 * Builds a minimal, unsigned JWT (`header.payload.signature`) whose payload is
 * the given object. The signature segment is irrelevant — `isAccessTokenExpired`
 * never verifies it.
 */
function makeJwt(payload: Record<string, unknown>): string {
  const encode = (value: object): string =>
    window
      .btoa(JSON.stringify(value))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

  return `${encode({ alg: "none", typ: "JWT" })}.${encode(payload)}.sig`;
}

describe("isAccessTokenExpired", () => {
  const fixedNow = new Date("2026-05-22T12:00:00.000Z");
  const nowInSeconds = Math.floor(fixedNow.getTime() / 1000);

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(fixedNow);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("treats a missing token as expired", () => {
    expect(isAccessTokenExpired(null)).toBe(true);
    expect(isAccessTokenExpired(undefined)).toBe(true);
    expect(isAccessTokenExpired("")).toBe(true);
  });

  it("treats a malformed token as not expired", () => {
    // A token without a payload segment cannot be decoded — kept usable so a
    // 401 path handles it rather than a false proactive refresh.
    expect(isAccessTokenExpired("not-a-jwt")).toBe(false);
  });

  it("treats a token without an exp claim as not expired", () => {
    expect(isAccessTokenExpired(makeJwt({ sub: "user" }))).toBe(false);
  });

  it("returns false for a token comfortably in the future", () => {
    const token = makeJwt({ exp: nowInSeconds + 3600 });
    expect(isAccessTokenExpired(token)).toBe(false);
  });

  it("returns true for a token already past its expiry", () => {
    const token = makeJwt({ exp: nowInSeconds - 60 });
    expect(isAccessTokenExpired(token)).toBe(true);
  });

  it("treats a token expiring inside the leeway window as expired", () => {
    const token = makeJwt({
      exp: nowInSeconds + TOKEN_EXPIRY_LEEWAY_SECONDS - 1,
    });
    expect(isAccessTokenExpired(token)).toBe(true);
  });

  it("treats a token expiring just outside the leeway as not expired", () => {
    const token = makeJwt({
      exp: nowInSeconds + TOKEN_EXPIRY_LEEWAY_SECONDS + 1,
    });
    expect(isAccessTokenExpired(token)).toBe(false);
  });

  it("honours a custom leeway value", () => {
    const token = makeJwt({ exp: nowInSeconds + 100 });

    expect(isAccessTokenExpired(token, 50)).toBe(false);
    expect(isAccessTokenExpired(token, 200)).toBe(true);
  });
});
