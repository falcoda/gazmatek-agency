const writeFileSync = jest.fn();

jest.mock("fs", () => ({
  writeFileSync,
}));

jest.mock("@lib/core", () => ({
  initSharedLib: jest.fn(),
  getSharedLibConfig: jest.fn().mockReturnValue({
    database: {
      host: "localhost",
      port: 5432,
      name: "mydb",
      user: "postgres",
      password: "postgres",
    },
  }),
}));

jest.mock("@src/helpers/config", () => ({
  config: {
    nodeEnv: "test",
    db: {
      host: "localhost",
      port: 5432,
      name: "mydb",
      username: "postgres",
      password: "postgres",
    },
  },
}));

jest.mock("@src/helpers/logger", () => ({
  logger: {
    info: jest.fn(),
  },
}));

describe("generatePgTypedConfig script", () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it("writes pgtyped.json with db/query include pattern", async () => {
    await import("@src/db/generatePgTypedConfig");

    expect(writeFileSync).toHaveBeenCalledTimes(1);

    const [, jsonContent] = writeFileSync.mock.calls[0] as [string, string];
    const parsed = JSON.parse(jsonContent);

    expect(parsed.srcDir).toBe("./src");
    expect(parsed.transforms).toEqual([
      {
        mode: "sql",
        include: "db/query/**/*.sql",
        emitTemplate: "{{dir}}/{{name}}.types.ts",
      },
    ]);
    expect(parsed.db).toEqual({
      host: "localhost",
      port: 5432,
      dbName: "mydb",
      user: "postgres",
      password: "postgres",
    });
  });
});
