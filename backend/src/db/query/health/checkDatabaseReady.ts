import { Pool } from "pg";

interface ReadyCheckRow {
  ready: number;
}

// SQL exception policy: SQL is allowed in db/query (centralized query layer).
export const checkDatabaseReady = async (db: Pool): Promise<boolean> => {
  const dbResult = await db.query<ReadyCheckRow>("SELECT 1 as ready");
  return dbResult.rows[0]?.ready === 1;
};
