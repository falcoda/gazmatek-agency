import { Pool, PoolClient } from "pg";

/**
 * Executes a callback inside a PostgreSQL transaction.
 * Automatically commits on success and rolls back on error.
 *
 * @example
 * const result = await withTransaction(pool, async (client) => {
 *   const user = await createUser(client, { email, passwordHash });
 *   await createRefreshToken(client, { userId: user.user_id, token });
 *   return user;
 * });
 */
export async function withTransaction<T>(
  pool: Pool,
  callback: (client: PoolClient) => Promise<T>,
): Promise<T> {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    const result = await callback(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
