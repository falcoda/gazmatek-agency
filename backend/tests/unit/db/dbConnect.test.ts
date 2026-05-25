const connect = jest.fn();
const end = jest.fn();
const release = jest.fn();
const on = jest.fn();

jest.mock("pg", () => ({
  Pool: jest.fn().mockImplementation(() => ({
    connect,
    end,
    on,
  })),
}));

jest.mock("@src/helpers/config", () => ({
  config: {
    db: {
      host: "localhost",
      name: "testdb",
      username: "postgres",
      password: "postgres",
      port: 5432,
      pool: {
        max: 10,
        idleTimeoutMs: 30000,
        connectionTimeoutMs: 5000,
        statementTimeoutMs: 15000,
      },
    },
  },
}));

jest.mock("@src/helpers/logger", () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

describe("dbConnect", () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    connect.mockResolvedValue({ release });
    end.mockResolvedValue(undefined);
  });

  it("connects once and reuses hasConnected guard", async () => {
    const { connectDB } = await import("@src/db/dbConnect");

    await connectDB();
    await connectDB();

    expect(connect).toHaveBeenCalledTimes(1);
    expect(release).toHaveBeenCalledTimes(1);
  });

  it("closeDB ends the pool and allows a future reconnection", async () => {
    const { connectDB, closeDB } = await import("@src/db/dbConnect");

    await connectDB();
    await closeDB();
    await connectDB();

    expect(end).toHaveBeenCalledTimes(1);
    expect(connect).toHaveBeenCalledTimes(2);
    expect(release).toHaveBeenCalledTimes(2);
  });
});
