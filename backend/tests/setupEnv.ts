process.env.NODE_ENV = "test";
process.env.APP_NAME = "backend-template-test";
process.env.APP_VERSION = "1.0.0";
process.env.APP_BASE_URL = "http://localhost:4001";
process.env.PORT = "4001";
process.env.CORS_ORIGIN = "http://localhost";
process.env.TRUST_PROXY = "false";

process.env.DATABASE_HOST = "localhost";
process.env.DATABASE = "template_test";
process.env.DATABASE_USERNAME = "postgres";
process.env.DATABASE_PASSWORD = "postgres";
process.env.DATABASE_PORT = "5432";

process.env.JWT_KEY = "test-jwt-key";
process.env.AUTH_STRATEGIES = "jwt,api-key";
process.env.API_KEY_HEADER = "x-api-key";
process.env.API_KEYS = "test-api-key";

// 64-char hex (32 bytes) so crypto helpers have a real AES-256-GCM key.
process.env.DATA_ENCRYPTION_KEY =
  "1cc3f7c061b52d66f62588c57e2d3bdddf76697339bd1a0018c4f80a0896e27c";

process.env.LOG_LEVEL = "error";
process.env.LOG_PATH = "logs";

process.env.FEATURE_SWAGGER = "true";
process.env.FEATURE_METRICS = "true";
process.env.FEATURE_NOTIFICATIONS = "false";
process.env.FEATURE_STORAGE = "false";
process.env.FEATURE_MAILER = "false";

process.env.SWAGGER_PATH = "/docs";
process.env.SWAGGER_JSON_PATH = "/docs/json";
process.env.SWAGGER_TITLE = "Backend Template API";
process.env.METRICS_PATH = "/metrics";
process.env.REQUEST_ID_HEADER = "x-request-id";

process.env.RATE_LIMIT_WINDOW_MS = "60000";
process.env.RATE_LIMIT_MAX_API = "100";
process.env.RATE_LIMIT_MAX_AUTH = "20";
process.env.RATE_LIMIT_MAX_DOCS = "100";
process.env.RATE_LIMIT_MAX_METRICS = "100";

process.env.NOTIFICATION_DRIVER = "logger";
process.env.TELEGRAM_BOT_TOKEN = "";
process.env.TELEGRAM_CHAT_ID = "";

process.env.STORAGE_DRIVER = "local";
process.env.STORAGE_LOCAL_ROOT = "storage";

process.env.MAILER_DRIVER = "logger";
process.env.MAILER_FROM = "no-reply@example.com";
process.env.MAILER_DEFAULT_TO = "";
process.env.MAILER_SMTP_HOST = "";
process.env.MAILER_SMTP_PORT = "587";
process.env.MAILER_SMTP_SECURE = "false";
process.env.MAILER_SMTP_USER = "";
process.env.MAILER_SMTP_PASSWORD = "";
