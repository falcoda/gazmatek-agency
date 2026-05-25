import { logger } from "@src/helpers/logger";

import { closeDB, connectDB, pool } from "./dbConnect";
import { runSqlFiles } from "./runSqlFiles";

const SEED_ADVISORY_LOCK_KEY = 4_247_002;

const run = async () => {
  await connectDB();
  const applied = await runSqlFiles(pool, {
    directoryName: "seeds",
    historyTable: "schema_seeds",
    advisoryLockKey: SEED_ADVISORY_LOCK_KEY,
    lockTimeoutMs: 5000,
  });

  logger.info(
    applied.length > 0
      ? `Applied seeds: ${applied.join(", ")}`
      : "No pending seeds",
  );
};

void run()
  .catch((error: Error) => {
    logger.error("Seed failed", { message: error.message });
    process.exitCode = 1;
  })
  .finally(async () => {
    await closeDB();
  });
