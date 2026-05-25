import { UnauthorizedError } from "@src/helpers/error/errors";
import { clearAuthUserCache } from "@src/middleware/auth/authUserCache";
import { authenticateWithJwt } from "@src/middleware/auth/strategies/jwt";
import { Request } from "express";
import jwt, { TokenExpiredError } from "jsonwebtoken";
import { Pool } from "pg";

describe("authenticateWithJwt", () => {
  const createPool = (
    rows: Array<{ user_id: number; email: string }>,
  ): Pool => {
    return {
      query: jest.fn().mockResolvedValue({ rows }),
    } as unknown as Pool;
  };

  // The auth-user cache is module-level state shared across tests; reset it so
  // each test exercises a clean cache-miss path unless it opts into a hit.
  beforeEach(() => {
    clearAuthUserCache();
  });

  it("authenticates with a bearer token", async () => {
    const token = jwt.sign(
      { data: "user@example.com" },
      process.env.JWT_KEY ?? "",
    );
    const request = {
      headers: {
        authorization: `Bearer ${token}`,
      },
    } as unknown as Request;
    const pool = createPool([{ user_id: 42, email: "user@example.com" }]);

    const user = await authenticateWithJwt(request, pool);

    expect(user).toEqual({
      id: 42,
      email: "user@example.com",
      authType: "jwt",
    });
  });

  it("authenticates with a token stored in cookies", async () => {
    const token = jwt.sign(
      { data: "cookie@example.com" },
      process.env.JWT_KEY ?? "",
    );
    const request = {
      headers: {
        cookie: `theme=dark; token=${token};`,
      },
    } as unknown as Request;
    const pool = createPool([{ user_id: 7, email: "cookie@example.com" }]);

    const user = await authenticateWithJwt(request, pool);

    expect(user?.id).toBe(7);
    expect(user?.email).toBe("cookie@example.com");
  });

  it("serves a repeat request from the cache without a second DB lookup", async () => {
    const token = jwt.sign(
      { data: "cached@example.com" },
      process.env.JWT_KEY ?? "",
    );
    const request = {
      headers: {
        authorization: `Bearer ${token}`,
      },
    } as unknown as Request;
    const pool = createPool([{ user_id: 11, email: "cached@example.com" }]);

    const first = await authenticateWithJwt(request, pool);
    const second = await authenticateWithJwt(request, pool);

    expect(first).toEqual({
      id: 11,
      email: "cached@example.com",
      authType: "jwt",
    });
    expect(second).toEqual(first);
    // The user lookup runs once; the second call is served from the cache.
    expect(pool.query).toHaveBeenCalledTimes(1);
  });

  it("returns null when no jwt token is provided", async () => {
    const request = {
      headers: {},
    } as unknown as Request;
    const pool = createPool([]);

    await expect(authenticateWithJwt(request, pool)).resolves.toBeNull();
  });

  it("throws when the token payload is invalid", async () => {
    const token = jwt.sign({ sub: "bad-payload" }, process.env.JWT_KEY ?? "");
    const request = {
      headers: {
        authorization: `Bearer ${token}`,
      },
    } as unknown as Request;
    const pool = createPool([]);

    await expect(authenticateWithJwt(request, pool)).rejects.toBeInstanceOf(
      UnauthorizedError,
    );
  });

  it("throws when the token is expired", async () => {
    const token = jwt.sign(
      { data: "expired@example.com" },
      process.env.JWT_KEY ?? "",
      { expiresIn: -1 },
    );
    const request = {
      headers: {
        authorization: `Bearer ${token}`,
      },
    } as unknown as Request;
    const pool = createPool([{ user_id: 9, email: "expired@example.com" }]);

    await expect(authenticateWithJwt(request, pool)).rejects.toBeInstanceOf(
      TokenExpiredError,
    );
  });
});
