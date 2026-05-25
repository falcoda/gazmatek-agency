jest.mock("@src/db/dbConnect", () => ({
  connectDB: jest.fn(),
  closeDB: jest.fn(),
  pool: { query: jest.fn() },
}));

jest.mock("@src/db/runSqlFiles", () => ({
  runSqlFiles: jest.fn(),
}));

jest.mock("@src/helpers/logger", () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

describe("db/seed script", () => {
  const flush = async () => {
    await new Promise<void>((resolve) => setImmediate(resolve));
    await new Promise<void>((resolve) => setImmediate(resolve));
  };

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    process.exitCode = 0;
  });

  afterAll(() => {
    // The failure-path test intentionally sets process.exitCode to 1;
    // reset it so a passing test run still exits 0.
    process.exitCode = 0;
  });

  it("runs seeds and logs applied files", async () => {
    const { runSqlFiles } = await import("@src/db/runSqlFiles");
    const { connectDB, closeDB, pool } = await import("@src/db/dbConnect");
    const { logger } = await import("@src/helpers/logger");

    (runSqlFiles as jest.Mock).mockResolvedValue([
      "001_seed_template_user.sql",
    ]);

    await import("@src/db/seed");
    await flush();

    expect(connectDB).toHaveBeenCalledTimes(1);
    expect(runSqlFiles).toHaveBeenCalledWith(pool, {
      directoryName: "seeds",
      historyTable: "schema_seeds",
      advisoryLockKey: 4247002,
      lockTimeoutMs: 5000,
    });
    expect(logger.info).toHaveBeenCalledWith(
      "Applied seeds: 001_seed_template_user.sql",
    );
    expect(closeDB).toHaveBeenCalledTimes(1);
  });

  it("marks process as failed and logs error when seed fails", async () => {
    const { runSqlFiles } = await import("@src/db/runSqlFiles");
    const { closeDB } = await import("@src/db/dbConnect");
    const { logger } = await import("@src/helpers/logger");

    (runSqlFiles as jest.Mock).mockRejectedValue(new Error("seed boom"));

    await import("@src/db/seed");
    await flush();

    expect(logger.error).toHaveBeenCalledWith("Seed failed", {
      message: "seed boom",
    });
    expect(process.exitCode).toBe(1);
    expect(closeDB).toHaveBeenCalledTimes(1);
  });
});
