jest.mock("@src/db/query/auth/getUserByApiKey.types", () => ({
  getUserByApiKey: { run: jest.fn() },
}));

import { getUserByApiKey } from "@src/db/query/auth/getUserByApiKey.types";
import { UnauthorizedError } from "@src/helpers/error/errors";
import { authenticateWithApiKey } from "@src/middleware/auth/strategies/apiKey";
import { Request } from "express";
import { Pool } from "pg";

const mockedRun = jest.mocked(getUserByApiKey.run);

describe("authenticateWithApiKey", () => {
  const pool = {} as Pool;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("authenticates with the configured api key header", async () => {
    mockedRun.mockResolvedValue([
      {
        user_id: "17",
        email: "user@example.com",
      },
    ]);

    const request = {
      headers: {
        "x-api-key": "test-api-key",
      },
    } as unknown as Request;

    await expect(authenticateWithApiKey(request, pool)).resolves.toEqual({
      id: "17",
      email: "user@example.com",
      authType: "api-key",
    });
  });

  it("authenticates with the Authorization ApiKey scheme", async () => {
    mockedRun.mockResolvedValue([
      {
        user_id: "17",
        email: "user@example.com",
      },
    ]);

    const request = {
      headers: {
        authorization: "ApiKey test-api-key",
      },
    } as unknown as Request;

    const user = await authenticateWithApiKey(request, pool);

    expect(user?.authType).toBe("api-key");
    expect(user?.email).toBe("user@example.com");
  });

  it("returns null when no api key is provided", async () => {
    const request = {
      headers: {},
    } as unknown as Request;

    await expect(authenticateWithApiKey(request, pool)).resolves.toBeNull();
  });

  it("throws when the api key is invalid", async () => {
    mockedRun.mockResolvedValue([]);

    const request = {
      headers: {
        "x-api-key": "wrong-key",
      },
    } as unknown as Request;

    await expect(authenticateWithApiKey(request, pool)).rejects.toBeInstanceOf(
      UnauthorizedError,
    );
  });

  it("throws when DB lookup fails", async () => {
    mockedRun.mockRejectedValue(new Error("db down"));

    const request = {
      headers: {
        "x-api-key": "test-api-key",
      },
    } as unknown as Request;

    await expect(authenticateWithApiKey(request, pool)).rejects.toBeInstanceOf(
      UnauthorizedError,
    );
  });
});
