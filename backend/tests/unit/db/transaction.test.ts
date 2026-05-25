import { withTransaction } from "@src/db/transaction";
import { Pool, PoolClient } from "pg";

const makeClient = () =>
  ({
    query: jest.fn(),
    release: jest.fn(),
  }) as unknown as jest.Mocked<PoolClient>;

const makePool = (client: PoolClient) =>
  ({
    connect: jest.fn().mockResolvedValue(client),
  }) as unknown as Pool;

describe("withTransaction()", () => {
  afterEach(() => jest.clearAllMocks());

  it("commits when the callback resolves", async () => {
    const client = makeClient();
    const pool = makePool(client);

    const result = await withTransaction(pool, async () => "ok");

    expect(client.query).toHaveBeenCalledWith("BEGIN");
    expect(client.query).toHaveBeenCalledWith("COMMIT");
    expect(client.query).not.toHaveBeenCalledWith("ROLLBACK");
    expect(client.release).toHaveBeenCalledTimes(1);
    expect(result).toBe("ok");
  });

  it("rolls back when the callback throws", async () => {
    const client = makeClient();
    const pool = makePool(client);

    await expect(
      withTransaction(pool, async () => {
        throw new Error("fail");
      }),
    ).rejects.toThrow("fail");

    expect(client.query).toHaveBeenCalledWith("BEGIN");
    expect(client.query).toHaveBeenCalledWith("ROLLBACK");
    expect(client.query).not.toHaveBeenCalledWith("COMMIT");
    expect(client.release).toHaveBeenCalledTimes(1);
  });

  it("passes the client to the callback", async () => {
    const client = makeClient();
    const pool = makePool(client);
    const callback = jest.fn().mockResolvedValue("done");

    await withTransaction(pool, callback);

    expect(callback).toHaveBeenCalledWith(client);
  });

  it("releases the client even when COMMIT throws", async () => {
    const client = makeClient();
    (client.query as jest.Mock)
      .mockResolvedValueOnce(undefined) // BEGIN
      .mockRejectedValueOnce(new Error("commit failed")); // COMMIT

    const pool = makePool(client);

    await expect(withTransaction(pool, async () => "ok")).rejects.toThrow(
      "commit failed",
    );

    expect(client.release).toHaveBeenCalledTimes(1);
  });

  it("returns the value from the callback", async () => {
    const client = makeClient();
    const pool = makePool(client);

    const result = await withTransaction(pool, async () => ({ id: 42 }));

    expect(result).toEqual({ id: 42 });
  });
});
