import {
  clearAuthUserCache,
  getCachedAuthUser,
  setCachedAuthUser,
} from "@src/middleware/auth/authUserCache";
import { AUTH_STRATEGY } from "@src/types/config";
import { AuthenticatedUser } from "@src/types/requestTypes";

const makeUser = (
  email: string,
  id: number | string = 1,
): AuthenticatedUser => ({
  id,
  email,
  authType: AUTH_STRATEGY.JWT,
});

describe("authUserCache", () => {
  beforeEach(() => {
    clearAuthUserCache();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe("getCachedAuthUser / setCachedAuthUser", () => {
    it("returns the stored user on a cache hit", () => {
      const user = makeUser("hit@example.com", 42);
      setCachedAuthUser("hit@example.com", user);

      expect(getCachedAuthUser("hit@example.com")).toEqual(user);
    });

    it("returns null on a cache miss for an unknown email", () => {
      expect(getCachedAuthUser("missing@example.com")).toBeNull();
    });

    it("keys entries by email — a different email is a miss", () => {
      setCachedAuthUser("a@example.com", makeUser("a@example.com"));

      expect(getCachedAuthUser("b@example.com")).toBeNull();
    });

    it("overwrites an existing entry for the same email", () => {
      setCachedAuthUser("same@example.com", makeUser("same@example.com", 1));
      setCachedAuthUser("same@example.com", makeUser("same@example.com", 2));

      expect(getCachedAuthUser("same@example.com")?.id).toBe(2);
    });
  });

  describe("TTL expiry", () => {
    it("returns the user before the TTL elapses", () => {
      jest.useFakeTimers();
      const user = makeUser("fresh@example.com");
      setCachedAuthUser("fresh@example.com", user);

      // Still well within the 30s TTL.
      jest.advanceTimersByTime(29_000);

      expect(getCachedAuthUser("fresh@example.com")).toEqual(user);
    });

    it("returns null once the TTL has elapsed", () => {
      jest.useFakeTimers();
      setCachedAuthUser("stale@example.com", makeUser("stale@example.com"));

      // Past the 30s TTL.
      jest.advanceTimersByTime(31_000);

      expect(getCachedAuthUser("stale@example.com")).toBeNull();
    });

    it("evicts the stale entry on read so it is not returned again", () => {
      jest.useFakeTimers();
      setCachedAuthUser("evict@example.com", makeUser("evict@example.com"));

      jest.advanceTimersByTime(31_000);
      expect(getCachedAuthUser("evict@example.com")).toBeNull();

      // No timers advanced further — still a miss because the entry was deleted.
      expect(getCachedAuthUser("evict@example.com")).toBeNull();
    });
  });

  describe("max-size clear", () => {
    it("drops the whole cache when it grows past the max size", () => {
      const MAX_ENTRIES = 5_000;

      // Fill the cache up to the cap.
      for (let i = 0; i < MAX_ENTRIES; i += 1) {
        setCachedAuthUser(
          `user${i}@example.com`,
          makeUser(`user${i}@example.com`),
        );
      }

      // An early entry is still cached while under the cap.
      expect(getCachedAuthUser("user0@example.com")).not.toBeNull();

      // The next insert hits the cap and clears everything first.
      setCachedAuthUser(
        "overflow@example.com",
        makeUser("overflow@example.com"),
      );

      expect(getCachedAuthUser("user0@example.com")).toBeNull();
      // The triggering entry is the only one left.
      expect(getCachedAuthUser("overflow@example.com")).not.toBeNull();
    });
  });

  describe("clearAuthUserCache", () => {
    it("removes all entries", () => {
      setCachedAuthUser("one@example.com", makeUser("one@example.com"));
      setCachedAuthUser("two@example.com", makeUser("two@example.com"));

      clearAuthUserCache();

      expect(getCachedAuthUser("one@example.com")).toBeNull();
      expect(getCachedAuthUser("two@example.com")).toBeNull();
    });
  });
});
