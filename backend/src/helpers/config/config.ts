import { NodeEnv } from "@lib/const";
import { initSharedLib, loadEnvFile } from "@lib/core";
import { NODE_ENV } from "@src/helpers/constants";
import {
  AppFeatureFlags,
  AUTH_STRATEGIES,
  AUTH_STRATEGY,
  AuthStrategy,
  LOG_LEVELS,
  MAIL_DRIVER,
  MAIL_DRIVERS,
  NOTIFICATION_DRIVER,
  NOTIFICATION_DRIVERS,
  STORAGE_DRIVER,
  STORAGE_DRIVERS,
} from "@src/types/config";
import fs from "fs";
import path from "path";
import { z } from "zod";

// Signature provider names (Rule 4: no magic strings). `documenso` requires a
// webhook secret so the webhook handler can authenticate inbound callbacks.
const SIGNATURE_PROVIDER = {
  STUB: "stub",
  DOCUMENSO: "documenso",
} as const;

const toBoolean = (value: unknown, defaultValue: boolean): boolean => {
  if (value === undefined) {
    return defaultValue;
  }

  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    return ["1", "true", "yes", "on"].includes(value.toLowerCase());
  }

  return Boolean(value);
};

const toList = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

const booleanFromEnv = (defaultValue: boolean) =>
  z.preprocess((value) => toBoolean(value, defaultValue), z.boolean());

const integerFromEnv = (defaultValue: number) =>
  z.preprocess((value) => {
    if (value === undefined || value === "") {
      return defaultValue;
    }

    return Number(value);
  }, z.number().int().nonnegative());

const stringListFromEnv = z.preprocess(toList, z.array(z.string()));

const optionalString = z.preprocess((value) => {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed === "" ? undefined : trimmed;
  }

  return value;
}, z.string().optional());

const isValidTimeZone = (value: string): boolean => {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: value });
    return true;
  } catch {
    return false;
  }
};

const envFilePath = path.resolve(process.cwd(), ".env");

if (process.env.NODE_ENV !== NODE_ENV.TEST && fs.existsSync(envFilePath)) {
  loadEnvFile();
}

const envSchema = z
  .object({
    NODE_ENV: z
      .enum([NODE_ENV.DEVELOPMENT, NODE_ENV.PRODUCTION, NODE_ENV.TEST])
      .default(NODE_ENV.DEVELOPMENT),
    APP_NAME: z.string().default("backend-template"),
    APP_VERSION: z.string().default("1.0.0"),
    APP_BASE_URL: optionalString,
    APP_TIMEZONE: z.string().default("UTC").refine(isValidTimeZone, {
      message: "APP_TIMEZONE must be a valid IANA timezone identifier",
    }),
    PORT: integerFromEnv(4001),
    CORS_ORIGIN: z.string().default("http://localhost"),
    TRUST_PROXY: booleanFromEnv(true),

    DATABASE_HOST: z.string().min(1, "DATABASE_HOST is required"),
    DATABASE: z.string().min(1, "DATABASE is required"),
    DATABASE_USERNAME: z.string().min(1, "DATABASE_USERNAME is required"),
    DATABASE_PASSWORD: z.string().min(1, "DATABASE_PASSWORD is required"),
    DATABASE_PORT: integerFromEnv(5432),
    // Connection pool tuning. Defaults are conservative for a single instance;
    // raise DATABASE_POOL_MAX when running fewer instances against a larger DB.
    DATABASE_POOL_MAX: integerFromEnv(20),
    DATABASE_POOL_IDLE_TIMEOUT_MS: integerFromEnv(30000),
    DATABASE_POOL_CONNECTION_TIMEOUT_MS: integerFromEnv(10000),
    DATABASE_STATEMENT_TIMEOUT_MS: integerFromEnv(30000),

    JWT_KEY: optionalString,
    AUTH_STRATEGIES: z.preprocess(
      toList,
      z.array(z.enum(AUTH_STRATEGIES)).default([AUTH_STRATEGY.JWT]),
    ),
    API_KEY_HEADER: z.string().default("x-api-key"),

    // Optional 32-byte AES-256-GCM key (64 hex chars) for application-level
    // field encryption. Leave unset if you do not use helpers/crypto.ts.
    DATA_ENCRYPTION_KEY: optionalString.refine(
      (value) => value === undefined || /^[0-9a-fA-F]{64}$/.test(value),
      {
        message:
          "DATA_ENCRYPTION_KEY must be a 64-character hexadecimal string (32 bytes)",
      },
    ),

    LOG_LEVEL: z.enum(LOG_LEVELS).default("debug"),
    LOG_PATH: z.string().default("logs"),

    FEATURE_SWAGGER: booleanFromEnv(true),
    FEATURE_METRICS: booleanFromEnv(true),
    FEATURE_NOTIFICATIONS: booleanFromEnv(false),
    FEATURE_STORAGE: booleanFromEnv(true),
    FEATURE_MAILER: booleanFromEnv(false),
    FEATURE_JOBS: booleanFromEnv(false),

    SWAGGER_PATH: z.string().default("/docs"),
    SWAGGER_JSON_PATH: z.string().default("/docs/json"),
    SWAGGER_TITLE: z.string().default("Backend Template API"),
    METRICS_PATH: z.string().default("/metrics"),
    REQUEST_ID_HEADER: z.string().default("x-request-id"),

    RATE_LIMIT_WINDOW_MS: integerFromEnv(60_000),
    RATE_LIMIT_MAX_API: integerFromEnv(300),
    RATE_LIMIT_MAX_AUTH: integerFromEnv(20),
    RATE_LIMIT_MAX_DOCS: integerFromEnv(60),
    RATE_LIMIT_MAX_METRICS: integerFromEnv(60),

    NOTIFICATION_DRIVER: z
      .enum(NOTIFICATION_DRIVERS)
      .default(NOTIFICATION_DRIVER.LOGGER),
    TELEGRAM_BOT_TOKEN: optionalString,
    TELEGRAM_CHAT_ID: optionalString,

    STORAGE_DRIVER: z.enum(STORAGE_DRIVERS).default(STORAGE_DRIVER.LOCAL),
    STORAGE_LOCAL_ROOT: z.string().default("storage"),
    STORAGE_S3_ENDPOINT: optionalString,
    STORAGE_S3_BUCKET: optionalString,
    STORAGE_S3_ACCESS_KEY: optionalString,
    STORAGE_S3_SECRET_KEY: optionalString,
    STORAGE_S3_REGION: z.string().default("us-east-1"),
    STORAGE_S3_FORCE_PATH_STYLE: booleanFromEnv(true),

    MAILER_DRIVER: z.enum(MAIL_DRIVERS).default(MAIL_DRIVER.LOGGER),
    MAILER_FROM: z.string().default("no-reply@example.com"),
    MAILER_DEFAULT_TO: stringListFromEnv,
    MAILER_SMTP_HOST: optionalString,
    MAILER_SMTP_PORT: integerFromEnv(587),
    MAILER_SMTP_SECURE: booleanFromEnv(false),
    MAILER_SMTP_USER: optionalString,
    MAILER_SMTP_PASSWORD: optionalString,

    SIGNATURE_PROVIDER: z.string().default(SIGNATURE_PROVIDER.STUB),
    SIGNATURE_WEBHOOK_SECRET: optionalString,

    DOCUMENSO_URL: optionalString,
    DOCUMENSO_API_KEY: optionalString,
    DOCUMENSO_WEBHOOK_SECRET: optionalString,
    PUPPETEER_BROWSER_WS_ENDPOINT: optionalString,
    PUPPETEER_EXECUTABLE_PATH: optionalString,
    MINIO_LOCAL_ENDPOINT: optionalString,
  })
  .superRefine((env, ctx) => {
    if (
      env.AUTH_STRATEGIES.includes(AUTH_STRATEGY.JWT) &&
      (!env.JWT_KEY || env.JWT_KEY.trim().length === 0)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["JWT_KEY"],
        message: "JWT_KEY is required when AUTH_STRATEGIES includes jwt",
      });
    }

    if (
      env.NOTIFICATION_DRIVER === NOTIFICATION_DRIVER.TELEGRAM &&
      (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["TELEGRAM_BOT_TOKEN"],
        message:
          "TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID are required for telegram notifications",
      });
    }

    if (env.STORAGE_DRIVER === STORAGE_DRIVER.S3) {
      const s3Fields: Array<keyof typeof env> = [
        "STORAGE_S3_ENDPOINT",
        "STORAGE_S3_BUCKET",
        "STORAGE_S3_ACCESS_KEY",
        "STORAGE_S3_SECRET_KEY",
      ];

      for (const field of s3Fields) {
        if (!env[field]) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: [field],
            message: `${field} is required when STORAGE_DRIVER is s3`,
          });
        }
      }
    }

    if (env.FEATURE_MAILER && env.MAILER_DRIVER === MAIL_DRIVER.SMTP) {
      const smtpFields: Array<keyof typeof env> = [
        "MAILER_SMTP_HOST",
        "MAILER_SMTP_USER",
        "MAILER_SMTP_PASSWORD",
      ];

      for (const field of smtpFields) {
        if (!env[field]) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: [field],
            message: `${field} is required when MAILER_DRIVER is smtp`,
          });
        }
      }
    }

    if (
      env.SIGNATURE_PROVIDER === SIGNATURE_PROVIDER.DOCUMENSO &&
      (!env.DOCUMENSO_WEBHOOK_SECRET ||
        env.DOCUMENSO_WEBHOOK_SECRET.trim().length === 0)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["DOCUMENSO_WEBHOOK_SECRET"],
        message:
          "DOCUMENSO_WEBHOOK_SECRET is required when SIGNATURE_PROVIDER is documenso",
      });
    }
  });

const parsedEnv = (() => {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.issues
        .map((issue) => {
          const path = issue.path.join(".");
          return `[${path}] ${issue.message}`;
        })
        .join("\n");

      console.error("❌ ENVIRONMENT CONFIGURATION ERROR");
      console.error("=".repeat(60));
      console.error(
        "Failed to start: invalid or missing environment variables:\n",
      );
      console.error(missingVars);
      console.error("=".repeat(60));
      console.error(
        "\nSee docs/EnvVariables.md for detailed configuration guide.",
      );
      console.error("Copy .env.example to .env and update values.\n");

      process.exit(1);
    }
    throw error;
  }
})();

const featureFlags: AppFeatureFlags = {
  swagger: parsedEnv.FEATURE_SWAGGER,
  metrics: parsedEnv.FEATURE_METRICS,
  notifications: parsedEnv.FEATURE_NOTIFICATIONS,
  storage: parsedEnv.FEATURE_STORAGE,
  mailer: parsedEnv.FEATURE_MAILER,
  jobs: parsedEnv.FEATURE_JOBS,
};

const serverPort = parsedEnv.PORT;

export const config = {
  app: {
    name: parsedEnv.APP_NAME,
    version:
      parsedEnv.APP_VERSION ?? process.env.npm_package_version ?? "1.0.0",
    baseUrl: parsedEnv.APP_BASE_URL ?? `http://localhost:${serverPort}`,
    // IANA timezone used to interpret zone-less wall-clock values
    // (see helpers/timezone.ts), never the server's own timezone.
    timezone: parsedEnv.APP_TIMEZONE,
  },
  nodeEnv: parsedEnv.NODE_ENV as NodeEnv,
  db: {
    host: parsedEnv.DATABASE_HOST,
    name: parsedEnv.DATABASE,
    username: parsedEnv.DATABASE_USERNAME,
    password: parsedEnv.DATABASE_PASSWORD,
    port: parsedEnv.DATABASE_PORT,
    pool: {
      max: parsedEnv.DATABASE_POOL_MAX,
      idleTimeoutMs: parsedEnv.DATABASE_POOL_IDLE_TIMEOUT_MS,
      connectionTimeoutMs: parsedEnv.DATABASE_POOL_CONNECTION_TIMEOUT_MS,
      statementTimeoutMs: parsedEnv.DATABASE_STATEMENT_TIMEOUT_MS,
    },
  },
  jwt: {
    key: parsedEnv.JWT_KEY ?? "",
  },
  log: {
    level: parsedEnv.LOG_LEVEL,
    path: parsedEnv.LOG_PATH,
  },
  server: {
    port: serverPort,
    corsOrigin: parsedEnv.CORS_ORIGIN,
    trustProxy: parsedEnv.TRUST_PROXY,
  },
  docs: {
    enabled: featureFlags.swagger,
    path: parsedEnv.SWAGGER_PATH,
    jsonPath: parsedEnv.SWAGGER_JSON_PATH,
    title: parsedEnv.SWAGGER_TITLE,
  },
  metrics: {
    enabled: featureFlags.metrics,
    path: parsedEnv.METRICS_PATH,
  },
  observability: {
    requestIdHeader: parsedEnv.REQUEST_ID_HEADER,
  },
  auth: {
    strategies:
      parsedEnv.AUTH_STRATEGIES.length > 0
        ? parsedEnv.AUTH_STRATEGIES
        : ([AUTH_STRATEGY.JWT] as AuthStrategy[]),
    apiKeyHeader: parsedEnv.API_KEY_HEADER,
  },
  security: {
    // Optional 32-byte AES-256-GCM key for application-level field encryption.
    // Null when DATA_ENCRYPTION_KEY is not set (see helpers/crypto.ts).
    dataEncryptionKey: parsedEnv.DATA_ENCRYPTION_KEY
      ? Buffer.from(parsedEnv.DATA_ENCRYPTION_KEY, "hex")
      : null,
  },
  rateLimit: {
    windowMs: parsedEnv.RATE_LIMIT_WINDOW_MS,
    maxApi: parsedEnv.RATE_LIMIT_MAX_API,
    maxAuth: parsedEnv.RATE_LIMIT_MAX_AUTH,
    maxDocs: parsedEnv.RATE_LIMIT_MAX_DOCS,
    maxMetrics: parsedEnv.RATE_LIMIT_MAX_METRICS,
  },
  notifications: {
    enabled: featureFlags.notifications,
    driver: parsedEnv.NOTIFICATION_DRIVER,
    telegramBotToken: parsedEnv.TELEGRAM_BOT_TOKEN ?? "",
    telegramChatId: parsedEnv.TELEGRAM_CHAT_ID ?? "",
  },
  storage: {
    enabled: featureFlags.storage,
    driver: parsedEnv.STORAGE_DRIVER,
    localRoot: parsedEnv.STORAGE_LOCAL_ROOT,
    s3: {
      endpoint: parsedEnv.STORAGE_S3_ENDPOINT ?? "",
      bucket: parsedEnv.STORAGE_S3_BUCKET ?? "",
      accessKey: parsedEnv.STORAGE_S3_ACCESS_KEY ?? "",
      secretKey: parsedEnv.STORAGE_S3_SECRET_KEY ?? "",
      region: parsedEnv.STORAGE_S3_REGION,
      forcePathStyle: parsedEnv.STORAGE_S3_FORCE_PATH_STYLE,
    },
  },
  mailer: {
    enabled: featureFlags.mailer,
    driver: parsedEnv.MAILER_DRIVER,
    from: parsedEnv.MAILER_FROM,
    defaultTo: parsedEnv.MAILER_DEFAULT_TO,
    smtp: {
      host: parsedEnv.MAILER_SMTP_HOST ?? "",
      port: parsedEnv.MAILER_SMTP_PORT,
      secure: parsedEnv.MAILER_SMTP_SECURE,
      user: parsedEnv.MAILER_SMTP_USER ?? "",
      password: parsedEnv.MAILER_SMTP_PASSWORD ?? "",
    },
  },
  signature: {
    provider: parsedEnv.SIGNATURE_PROVIDER,
    webhookSecret: parsedEnv.SIGNATURE_WEBHOOK_SECRET ?? "",
  },
  documenso: {
    url: parsedEnv.DOCUMENSO_URL ?? "",
    apiKey: parsedEnv.DOCUMENSO_API_KEY ?? "",
    webhookSecret: parsedEnv.DOCUMENSO_WEBHOOK_SECRET ?? "",
    minioLocalEndpoint: parsedEnv.MINIO_LOCAL_ENDPOINT ?? "",
  },
  puppeteer: {
    browserWsEndpoint: parsedEnv.PUPPETEER_BROWSER_WS_ENDPOINT ?? "",
    executablePath: parsedEnv.PUPPETEER_EXECUTABLE_PATH ?? "",
  },
  featureFlags,
};

initSharedLib({
  nodeEnv: config.nodeEnv,
  logger: {
    logLevel: config.log.level,
    logPath: config.log.path,
  },
  database: {
    host: config.db.host,
    port: config.db.port,
    name: config.db.name,
    user: config.db.username,
    password: config.db.password,
  },
  telegram:
    config.notifications.driver === NOTIFICATION_DRIVER.TELEGRAM &&
    config.notifications.telegramBotToken &&
    config.notifications.telegramChatId
      ? {
          botToken: config.notifications.telegramBotToken,
          chatId: config.notifications.telegramChatId,
        }
      : undefined,
});
