import { NodeEnv } from "@lib/const";
import { getSharedLibConfig, initSharedLib } from "@lib/core";
import { config } from "@src/helpers/config";
import { logger } from "@src/helpers/logger";
import fs from "fs";
import path from "path";

// Initialize the shared lib with database config so getSharedLibConfig() works
initSharedLib({
  nodeEnv: config.nodeEnv as NodeEnv,
  database: {
    host: config.db.host,
    port: config.db.port,
    name: config.db.name,
    user: config.db.username,
    password: config.db.password,
  },
});

// Delegate to the shared lib's config reader (mirrors @lib/modules/db/generatePgTypedConfig)
const libConfig = getSharedLibConfig();

if (!libConfig.database) {
  throw new Error("[pgtyped] Database config not provided.");
}

interface PgTypedConfig {
  transforms: Array<{ mode: string; include: string; emitTemplate: string }>;
  srcDir: string;
  db: {
    host: string;
    port: number;
    dbName: string;
    user: string;
    password: string;
  };
}

const pgConfig: PgTypedConfig = {
  transforms: [
    {
      mode: "sql",
      include: "db/query/**/*.sql",
      emitTemplate: "{{dir}}/{{name}}.types.ts",
    },
  ],
  srcDir: "./src",
  db: {
    host: libConfig.database.host,
    port: libConfig.database.port,
    dbName: libConfig.database.name,
    user: libConfig.database.user,
    password: libConfig.database.password,
  },
};

const configFile = path.resolve(__dirname, "../../pgtyped.json");
fs.writeFileSync(configFile, JSON.stringify(pgConfig, null, 2), "utf8");
logger.info(`pgtyped.json generated at ${configFile}`);
