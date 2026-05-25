jest.mock("@src/middleware/auth/strategies/apiKey", () => ({
  authenticateWithApiKey: jest.fn(),
}));

jest.mock("@src/middleware/auth/strategies/jwt", () => ({
  authenticateWithJwt: jest.fn(),
}));

import {
  ExpiredTokenError,
  UnauthorizedError,
} from "@src/helpers/error/errors";
import { authenticate } from "@src/middleware/auth/authenticate";
import { authenticateWithApiKey } from "@src/middleware/auth/strategies/apiKey";
import { authenticateWithJwt } from "@src/middleware/auth/strategies/jwt";
import { NextFunction, Request, Response } from "express";
import jwt, { TokenExpiredError } from "jsonwebtoken";
import { Pool } from "pg";

describe("authenticate middleware", () => {
  const mockedApiKey = jest.mocked(authenticateWithApiKey);
  const mockedJwt = jest.mocked(authenticateWithJwt);
  const pool = {} as Pool;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("uses the first successful strategy", async () => {
    mockedJwt.mockResolvedValue({
      id: 1,
      email: "jwt@example.com",
      authType: "jwt",
    });

    const request = { headers: {} } as unknown as Request;
    const response = {} as Response;
    const next = jest.fn() as NextFunction;

    await authenticate(pool)(request, response, next);

    expect(mockedJwt).toHaveBeenCalled();
    expect(mockedApiKey).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith();
  });

  it("falls back to the next strategy when the first returns null", async () => {
    mockedJwt.mockResolvedValue(null);
    mockedApiKey.mockResolvedValue({
      id: "api-key",
      authType: "api-key",
    });

    const request = { headers: {} } as unknown as Request;
    const response = {} as Response;
    const next = jest.fn() as NextFunction;

    await authenticate(pool)(request, response, next);

    expect(mockedJwt).toHaveBeenCalled();
    expect(mockedApiKey).toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith();
  });

  it("returns UnauthorizedError when no strategy authenticates", async () => {
    mockedJwt.mockResolvedValue(null);
    mockedApiKey.mockResolvedValue(null);

    const request = { headers: {} } as unknown as Request;
    const response = {} as Response;
    const next = jest.fn() as NextFunction;

    await authenticate(pool)(request, response, next);

    expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
  });

  it("maps token expiration to ExpiredTokenError", async () => {
    mockedJwt.mockRejectedValue(
      new TokenExpiredError("jwt expired", new Date()),
    );

    const request = { headers: {} } as unknown as Request;
    const response = {} as Response;
    const next = jest.fn() as NextFunction;

    await authenticate(pool)(request, response, next);

    expect(next).toHaveBeenCalledWith(expect.any(ExpiredTokenError));
  });

  it("maps JsonWebTokenError to UnauthorizedError", async () => {
    mockedJwt.mockRejectedValue(new jwt.JsonWebTokenError("invalid token"));

    const request = { headers: {} } as unknown as Request;
    const response = {} as Response;
    const next = jest.fn() as NextFunction;

    await authenticate(pool)(request, response, next);

    expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
  });
});
