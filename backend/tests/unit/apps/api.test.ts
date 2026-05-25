jest.mock("@src/db/dbConnect", () => ({
  connectDB: jest.fn(),
  closeDB: jest.fn(),
}));

jest.mock("@src/helpers/config", () => ({
  config: {
    server: { port: 4001 },
    docs: { enabled: true, path: "/docs" },
    metrics: { enabled: true, path: "/metrics" },
    featureFlags: { jobs: false },
  },
}));

jest.mock("@src/helpers/lifecycle", () => ({
  registerShutdownTask: jest.fn(),
  registerProcessSignalHandlers: jest.fn(),
}));

jest.mock("@src/helpers/logger", () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock("@src/services/mailer", () => ({
  closeMailerService: jest.fn(),
}));

jest.mock("@src/services/notifications", () => ({
  closeNotificationService: jest.fn(),
}));

jest.mock("@src/services/storage", () => ({
  closeStorageService: jest.fn(),
}));

describe("startApi", () => {
  const createServerMock = () => {
    const close = jest.fn((callback: (error?: Error | null) => void) =>
      callback(null),
    );

    return { close };
  };

  const flush = async () => {
    await new Promise<void>((resolve) => setImmediate(resolve));
  };

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  it("boots the API and registers lifecycle shutdown tasks", async () => {
    const server = createServerMock();
    const listen = jest.fn((_: number, cb: () => void) => {
      cb();
      return server;
    });

    jest.doMock("@src/apps/createApp", () => ({
      createApp: jest.fn().mockReturnValue({ listen }),
    }));

    const { startApi } = await import("@src/apps/api");
    const { connectDB } = await import("@src/db/dbConnect");
    const { registerShutdownTask, registerProcessSignalHandlers } =
      await import("@src/helpers/lifecycle");

    const result = await startApi();
    await flush();

    expect(connectDB).toHaveBeenCalledTimes(1);
    expect(listen).toHaveBeenCalledWith(4001, expect.any(Function));
    expect(registerShutdownTask).toHaveBeenCalledTimes(6);
    expect(registerShutdownTask).toHaveBeenCalledWith(
      "database-pool",
      expect.any(Function),
    );
    expect(registerShutdownTask).toHaveBeenCalledWith(
      "storage-service",
      expect.any(Function),
    );
    expect(registerShutdownTask).toHaveBeenCalledWith(
      "notification-service",
      expect.any(Function),
    );
    expect(registerShutdownTask).toHaveBeenCalledWith(
      "mailer-service",
      expect.any(Function),
    );
    expect(registerShutdownTask).toHaveBeenCalledWith(
      "job-scheduler",
      expect.any(Function),
    );
    expect(registerShutdownTask).toHaveBeenCalledWith(
      "http-server",
      expect.any(Function),
    );
    expect(registerProcessSignalHandlers).toHaveBeenCalledTimes(1);

    expect(result.server).toBe(server);
    expect(result.app).toEqual(expect.objectContaining({ listen }));
  });

  it("propagates server close errors through the registered http shutdown task", async () => {
    const server = {
      close: jest.fn((callback: (error?: Error | null) => void) =>
        callback(new Error("close failed")),
      ),
    };

    jest.doMock("@src/apps/createApp", () => ({
      createApp: jest.fn().mockReturnValue({
        listen: jest.fn((_: number, cb: () => void) => {
          cb();
          return server;
        }),
      }),
    }));

    const { startApi } = await import("@src/apps/api");
    const { registerShutdownTask } = await import("@src/helpers/lifecycle");

    await startApi();

    const httpServerTaskCall = (
      registerShutdownTask as jest.Mock
    ).mock.calls.find((call) => call[0] === "http-server");
    const httpServerTask = httpServerTaskCall?.[1] as () => Promise<void>;

    await expect(httpServerTask()).rejects.toThrow("close failed");
  });
});
