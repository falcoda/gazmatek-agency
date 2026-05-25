jest.mock("fs", () => ({
  existsSync: jest.fn(),
  readdirSync: jest.fn(),
  readFileSync: jest.fn(),
}));

import { runSqlFiles } from "@src/db/runSqlFiles";
import { ConflictError } from "@src/helpers/error/errors";
import fs from "fs";
import type { Pool, PoolClient } from "pg";

const mockedFs = fs as jest.Mocked<typeof fs>;

describe("runSqlFiles", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedFs.existsSync.mockImplementation((targetPath) =>
      String(targetPath).includes("migrations"),
    );
    mockedFs.readdirSync.mockReturnValue(["001_test.sql"] as never);
    mockedFs.readFileSync.mockReturnValue("SELECT 1;" as never);
  });

  it("acquires and releases the advisory lock when configured", async () => {
    const query = jest
      .fn()
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce({ rows: [{ locked: true }] })
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce({ rows: [{ pg_advisory_unlock: true }] });
    const release = jest.fn();
    const client = { query, release } as unknown as PoolClient;
    const pool = {
      connect: jest.fn().mockResolvedValue(client),
    } as unknown as Pool;

    const applied = await runSqlFiles(pool, {
      directoryName: "migrations",
      historyTable: "schema_migrations",
      advisoryLockKey: 42,
      lockTimeoutMs: 5000,
    });

    expect(applied).toEqual(["001_test.sql"]);
    expect(query).toHaveBeenNthCalledWith(1, "SET lock_timeout = '5000ms'");
    expect(query).toHaveBeenNthCalledWith(
      2,
      "SELECT pg_try_advisory_lock($1) AS locked",
      [42],
    );
    expect(query).toHaveBeenLastCalledWith(
      "SELECT pg_advisory_unlock($1)",
      [42],
    );
    expect(release).toHaveBeenCalled();
  });

  it("fails when another migration already holds the advisory lock", async () => {
    const query = jest
      .fn()
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce({ rows: [{ locked: false }] })
      .mockResolvedValueOnce({ rows: [{ pg_advisory_unlock: false }] });
    const release = jest.fn();
    const client = { query, release } as unknown as PoolClient;
    const pool = {
      connect: jest.fn().mockResolvedValue(client),
    } as unknown as Pool;

    await expect(
      runSqlFiles(pool, {
        directoryName: "migrations",
        historyTable: "schema_migrations",
        advisoryLockKey: 42,
        lockTimeoutMs: 5000,
      }),
    ).rejects.toBeInstanceOf(ConflictError);

    expect(query).toHaveBeenCalledWith("SELECT pg_advisory_unlock($1)", [42]);
    expect(release).toHaveBeenCalled();
  });
});
