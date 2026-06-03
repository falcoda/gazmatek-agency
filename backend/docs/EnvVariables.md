# Environment Variables Reference

This document describes all environment variables used by the Backend Template API.

## Quick Reference

| Variable            | Required    | Type                                    | Default       | Description                                                                 |
| ------------------- | ----------- | --------------------------------------- | ------------- | --------------------------------------------------------------------------- |
| `ENVIRONMENT`       | No          | string                                  | `prod`        | Deployment prefix used in Docker container names (`prod`, `dev`, `staging`) |
| `NODE_ENV`          | No          | `development` \| `production` \| `test` | `development` | Runtime environment                                                         |
| `DATABASE_HOST`     | **Yes**     | string                                  | —             | PostgreSQL hostname                                                         |
| `DATABASE`          | **Yes**     | string                                  | —             | Database name                                                               |
| `DATABASE_USERNAME` | **Yes**     | string                                  | —             | PostgreSQL username                                                         |
| `DATABASE_PASSWORD` | **Yes**     | string                                  | —             | PostgreSQL password                                                         |
| `JWT_KEY`           | Conditional | string                                  | —             | **Required if** `AUTH_STRATEGIES` includes `jwt`                            |
| `PORT`              | No          | integer                                 | `4001`        | Server listening port                                                       |

---

## Configuration by Category

### Application Settings

#### `ENVIRONMENT`

- **Type**: string
- **Default**: `prod`
- **Description**: Logical deployment prefix used in Docker `container_name` values.
- **Examples**: `prod`, `dev`, `staging`
- **Important**: This is an infrastructure naming scope, not the Node.js runtime mode.
- **Container naming**:
  - `website`: `${ENVIRONMENT}-${APP_NAME}`
  - `migrate`: `${ENVIRONMENT}-${APP_NAME}-migrate`
  - `seed`: `${ENVIRONMENT}-${APP_NAME}-seed`
  - `db`: `${ENVIRONMENT}-${DATABASE}-db`

---

#### `NODE_ENV`

- **Type**: `development` | `production` | `test`
- **Default**: `development`
- **Description**: Environment mode. Affects logging, error handling, and feature availability.
- **Production Notes**: Always set to `production` for deployed instances.
- **Important**: This is runtime behavior configuration and does not define Docker container prefixes.

#### `ENVIRONMENT` vs `NODE_ENV`

- Use `ENVIRONMENT` to namespace deployment resources and container names.
- Use `NODE_ENV` to control application runtime behavior.
- They are complementary and should both be set explicitly.

Typical pairs:

- Local development: `ENVIRONMENT=dev` + `NODE_ENV=development`
- Staging: `ENVIRONMENT=staging` + `NODE_ENV=production`
- Production: `ENVIRONMENT=prod` + `NODE_ENV=production`

#### `APP_NAME`

- **Type**: string
- **Default**: `backend-template`
- **Description**: Application name, used in logs and documentation.

#### `APP_VERSION`

- **Type**: string
- **Default**: `1.0.0`
- **Description**: Semantic version. Defaults to `package.json` version if not set.

#### `APP_BASE_URL`

- **Type**: string (URL)
- **Default**: `http://localhost:{PORT}`
- **Description**: Public-facing URL of the API. Used in Swagger docs and documentation links.
- **Example**: `https://api.example.com`

#### `APP_TIMEZONE`

- **Type**: string (IANA timezone identifier)
- **Default**: `UTC`
- **Description**: Timezone used to interpret zone-less wall-clock values (see `src/helpers/timezone.ts`). Independent of the server's own timezone. Validated at startup.
- **Examples**: `UTC`, `Europe/Paris`, `America/New_York`

---

### Server Configuration

#### `PORT`

- **Type**: integer (0–65535)
- **Default**: `4001`
- **Description**: TCP port on which the HTTP server listens.
- **Dev**: Use `4001` or any free port.
- **Production**: Usually `80`, `443`, or behind reverse proxy.

#### `CORS_ORIGIN`

- **Type**: string (URL or `*`)
- **Default**: `http://localhost`
- **Description**: Allowed origin(s) for CORS (Cross-Origin Resource Sharing).
- **Examples**:
  - Dev: `http://localhost:3000`
  - Prod: `https://example.com`
  - Multiple: `https://example.com,https://app.example.com`

#### `TRUST_PROXY`

- **Type**: boolean (true/false or `1`/`0`)
- **Default**: `true`
- **Description**: Trust `X-Forwarded-For` headers from reverse proxies. Set to `true` if behind Nginx, Traefik, etc.

---

### Database (REQUIRED)

**All database variables are required and must be configured for the application to start.**

#### `DATABASE_HOST`

- **Type**: string
- **Description**: PostgreSQL server hostname or IP.
- **Examples**: `localhost`, `db.example.com`, `postgres-service.default.svc.cluster.local`

#### `DATABASE`

- **Type**: string
- **Description**: Name of the PostgreSQL database to connect to.
- **Example**: `myapp_db`

#### `DATABASE_USERNAME`

- **Type**: string
- **Description**: PostgreSQL user account.
- **Example**: `postgres` (default) or `myapp_user`

#### `DATABASE_PASSWORD`

- **Type**: string
- **Description**: PostgreSQL user password.
- **Security**: Never commit to version control. Use secrets management (environment variables, HashiCorp Vault, etc.).

#### `DATABASE_PORT`

- **Type**: integer
- **Default**: `5432`
- **Description**: PostgreSQL server port.

#### Connection Pool Tuning (optional)

These variables tune the `pg` connection pool. Defaults are conservative for a single instance; raise `DATABASE_POOL_MAX` when running fewer instances against a larger database.

| Variable                              | Default | Description                                                       |
| ------------------------------------- | ------- | ----------------------------------------------------------------- |
| `DATABASE_POOL_MAX`                   | `20`    | Maximum concurrent connections held by the pool.                  |
| `DATABASE_POOL_IDLE_TIMEOUT_MS`       | `30000` | Idle time (ms) before a pooled client is released.                |
| `DATABASE_POOL_CONNECTION_TIMEOUT_MS` | `10000` | Time (ms) to wait for a free connection before failing fast.      |
| `DATABASE_STATEMENT_TIMEOUT_MS`       | `30000` | Server-side cap (ms) on any single query / idle open transaction. |

---

### Authentication

#### `AUTH_STRATEGIES`

- **Type**: comma-separated list
- **Options**: `jwt`, `api-key`
- **Default**: `jwt`
- **Description**: Enabled authentication strategies.
- **Examples**:
  - Single: `AUTH_STRATEGIES=jwt`
  - Multiple: `AUTH_STRATEGIES=jwt,api-key`
- **Note**: If `jwt` is enabled, `JWT_KEY` must be set.

#### `JWT_KEY`

- **Type**: string (hex, min 32 bytes)
- **Required**: **Only if** `AUTH_STRATEGIES` includes `jwt`
- **Description**: Secret key for signing/verifying JWT tokens.
- **Security**:
  - Never commit to version control.
  - Generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
  - Minimum 32 bytes recommended (64 hex characters).
  - Use a key management system in production.

#### `API_KEY_HEADER`

- **Type**: string
- **Default**: `x-api-key`
- **Description**: HTTP header name for API key authentication.
- **Example**: Clients send `x-api-key: mykey123` in request headers.

---

### Auth Cookies

The admin, artist, and client access & refresh tokens are delivered as httpOnly
cookies (per-actor names, e.g. `admin_token` / `admin_refresh_token`). These
variables tune the cookie attributes; all are optional with safe defaults.

#### `COOKIE_SECURE`

- **Type**: boolean (`true` / `false`)
- **Default**: `true` when `NODE_ENV=production`, otherwise `false`
- **Description**: Marks the auth cookies `Secure` so the browser only sends them
  over HTTPS. The default keeps local HTTP development working while enforcing
  HTTPS in production. Must be `true` when `COOKIE_SAMESITE=none`.

#### `COOKIE_SAMESITE`

- **Type**: `lax` | `strict` | `none`
- **Default**: `lax`
- **Description**: `SameSite` policy for the auth cookies. `lax` suits a
  same-origin SPA (the dev proxy and a single-domain deploy). Use `none` for a
  cross-origin SPA where the frontend and API live on different domains — it then
  **requires** `COOKIE_SECURE=true` (validated at startup).

#### `COOKIE_DOMAIN`

- **Type**: string
- **Default**: unset (cookies bind to the exact API host)
- **Description**: Scopes the auth cookies to a parent domain, e.g.
  `.example.com` to share them across `app.` and `api.` subdomains.

---

### Security

#### `DATA_ENCRYPTION_KEY`

- **Type**: string (64-character hexadecimal — 32 bytes)
- **Required**: No (optional)
- **Description**: AES-256-GCM key for application-level field encryption via `src/helpers/crypto.ts`. Leave unset if you do not use reversible encryption; the encrypt/decrypt helpers throw a clear error when called without a key.
- **Security**:
  - Never commit to version control.
  - Generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
  - Rotating the key makes previously encrypted values unreadable.

---

### Logging

#### `LOG_LEVEL`

- **Type**: string
- **Options**: `trace`, `debug`, `info`, `warn`, `error`, `fatal`
- **Default**: `debug`
- **Description**: Minimum severity level for log output.
- **Dev**: `debug` (verbose)
- **Production**: `info` or `warn` (less verbose)

#### `LOG_PATH`

- **Type**: string (directory path)
- **Default**: `logs`
- **Description**: Directory where log files are written.
- **Note**: Relative to current working directory (usually project root).

---

### Feature Flags

Feature flags allow enabling/disabling optional services without code changes.

#### `FEATURE_SWAGGER`

- **Type**: boolean
- **Default**: `true`
- **Description**: Enable/disable Swagger UI and OpenAPI documentation.

#### `FEATURE_METRICS`

- **Type**: boolean
- **Default**: `true`
- **Description**: Enable/disable Prometheus metrics endpoint.

#### `FEATURE_NOTIFICATIONS`

- **Type**: boolean
- **Default**: `false`
- **Description**: Enable/disable notification service (requires `NOTIFICATION_DRIVER` config).

#### `FEATURE_STORAGE`

- **Type**: boolean
- **Default**: `true`
- **Description**: Enable/disable file storage service.

#### `FEATURE_MAILER`

- **Type**: boolean
- **Default**: `false`
- **Description**: Enable/disable email service (requires `MAILER_DRIVER` config).

#### `FEATURE_JOBS`

- **Type**: boolean
- **Default**: `false`
- **Description**: Enable/disable the background job scheduler (`src/jobs/scheduler.ts`). When `false`, no cron jobs are registered.

---

### Swagger / API Documentation

#### `SWAGGER_PATH`

- **Type**: string (URL path)
- **Default**: `/docs`
- **Description**: HTTP path where Swagger UI is served.

#### `SWAGGER_JSON_PATH`

- **Type**: string (URL path)
- **Default**: `/docs/json`
- **Description**: HTTP path where OpenAPI 3.0 JSON schema is served.

#### `SWAGGER_TITLE`

- **Type**: string
- **Default**: `Backend Template API`
- **Description**: Title displayed in Swagger UI.

---

### Metrics (Prometheus)

#### `METRICS_PATH`

- **Type**: string (URL path)
- **Default**: `/metrics`
- **Description**: HTTP path where Prometheus metrics are exposed.
- **Note**: Used by monitoring systems to scrape metrics.

---

### Observability

#### `REQUEST_ID_HEADER`

- **Type**: string (HTTP header name)
- **Default**: `x-request-id`
- **Description**: HTTP request header name for correlation IDs.
- **Usage**: Each request gets a unique correlation ID, useful for tracing logs.

---

### Rate Limiting

Rate limiting is applied per endpoint group and uses an in-memory store (resets on restart).

**Future**: For distributed deployments, use Redis-based rate limiting.

#### `RATE_LIMIT_WINDOW_MS`

- **Type**: integer (milliseconds)
- **Default**: `60000` (1 minute)
- **Description**: Time window for rate limit accounting.

#### `RATE_LIMIT_MAX_API`

- **Type**: integer
- **Default**: `300`
- **Description**: Max requests per window for general API routes.

#### `RATE_LIMIT_MAX_AUTH`

- **Type**: integer
- **Default**: `20`
- **Description**: Max requests per window for authentication endpoints (stricter).

#### `RATE_LIMIT_MAX_DOCS`

- **Type**: integer
- **Default**: `60`
- **Description**: Max requests per window for documentation endpoints (Swagger UI).

#### `RATE_LIMIT_MAX_METRICS`

- **Type**: integer
- **Default**: `60`
- **Description**: Max requests per window for metrics endpoint.

---

### Notifications (Optional)

**Requires**: `FEATURE_NOTIFICATIONS=true`

#### `NOTIFICATION_DRIVER`

- **Type**: `logger` | `telegram`
- **Default**: `logger`
- **Description**: Backend for sending notifications.
- **Options**:
  - `logger`: Log to console/files (default, no external service needed).
  - `telegram`: Send to Telegram Bot API (requires token & chat ID).

#### `TELEGRAM_BOT_TOKEN`

- **Type**: string
- **Required**: Only if `NOTIFICATION_DRIVER=telegram`
- **Description**: Telegram Bot API token.
- **Obtain**: Create bot with Telegram's [@BotFather](https://t.me/botfather), get token.

#### `TELEGRAM_CHAT_ID`

- **Type**: string (numeric chat ID)
- **Required**: Only if `NOTIFICATION_DRIVER=telegram`
- **Description**: Telegram chat ID where messages will be sent.
- **Example**: `123456789`

---

### Storage (Optional)

**Requires**: `FEATURE_STORAGE=true`

#### `STORAGE_DRIVER`

- **Type**: `local` | `s3`
- **Default**: `local`
- **Description**: Backend for file storage.
- **Options**:
  - `local`: local file system storage.
  - `s3`: S3-compatible object storage (AWS S3 or MinIO).

#### `STORAGE_LOCAL_ROOT`

- **Type**: string (directory path)
- **Default**: `storage`
- **Description**: Root directory for local file storage.
- **Note**: Created automatically if it doesn't exist.

#### S3 Storage (required only if `STORAGE_DRIVER=s3`)

| Variable                      | Required | Default     | Description                                              |
| ----------------------------- | -------- | ----------- | -------------------------------------------------------- |
| `STORAGE_S3_ENDPOINT`         | **Yes**  | —           | S3 endpoint URL (e.g. `http://localhost:9000` for MinIO).|
| `STORAGE_S3_BUCKET`           | **Yes**  | —           | Bucket name (created automatically if missing).          |
| `STORAGE_S3_ACCESS_KEY`       | **Yes**  | —           | Access key ID.                                           |
| `STORAGE_S3_SECRET_KEY`       | **Yes**  | —           | Secret access key.                                       |
| `STORAGE_S3_REGION`           | No       | `us-east-1` | AWS region.                                              |
| `STORAGE_S3_FORCE_PATH_STYLE` | No       | `true`      | Use path-style URLs (required for MinIO).                |

---

### Mailer (Optional)

**Requires**: `FEATURE_MAILER=true`

#### `MAILER_DRIVER`

- **Type**: `logger` | `smtp` | `disabled`
- **Default**: `logger`
- **Description**: Backend for sending emails.
- **Options**:
  - `logger`: Log to console/files (development).
  - `smtp`: Send via SMTP server (production).
  - `disabled`: Disable email functionality.

#### `MAILER_FROM`

- **Type**: string (email address)
- **Default**: `no-reply@example.com`
- **Description**: "From" email address for outgoing emails.

#### `MAILER_DEFAULT_TO`

- **Type**: comma-separated list (email addresses)
- **Description**: Default recipients for emails sent without explicit `to` field.
- **Example**: `MAILER_DEFAULT_TO=admin@example.com,support@example.com`

#### `MAILER_SMTP_HOST`

- **Type**: string
- **Required**: Only if `MAILER_DRIVER=smtp`
- **Description**: SMTP server hostname.
- **Example**: `smtp.gmail.com`, `mail.example.com`

#### `MAILER_SMTP_PORT`

- **Type**: integer
- **Default**: `587`
- **Description**: SMTP server port.
- **Common**: `25` (plain), `465` (SSL), `587` (TLS)

#### `MAILER_SMTP_SECURE`

- **Type**: boolean
- **Default**: `false`
- **Description**: Use SSL/TLS encryption for SMTP connection (port 465).
- **Note**: Set to `true` for port 465, `false` for port 587 (STARTTLS).

#### `MAILER_SMTP_USER`

- **Type**: string
- **Required**: Only if `MAILER_DRIVER=smtp`
- **Description**: SMTP authentication username.
- **Example**: `your-email@gmail.com`

#### `MAILER_SMTP_PASSWORD`

- **Type**: string
- **Required**: Only if `MAILER_DRIVER=smtp`
- **Description**: SMTP authentication password.
- **Security**: Never commit to version control. Use secrets management.
- **Gmail**: Use [App Passwords](https://myaccount.google.com/apppasswords), not account password.

---

## Environment Setup Examples

### Local Development

```bash
NODE_ENV=development
DATABASE_HOST=localhost
DATABASE=mydb
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=postgres
JWT_KEY=dev-key-change-in-production-32-bytes-min
AUTH_STRATEGIES=jwt
CORS_ORIGIN=http://localhost:3000
PORT=4001
LOG_LEVEL=debug
```

### Docker Compose (See docker-compose.yml)

```bash
ENVIRONMENT=dev
NODE_ENV=development
DATABASE_HOST=db
DATABASE=mydb
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=postgres
JWT_KEY=dev-key-generated-randomly
AUTH_STRATEGIES=jwt
CORS_ORIGIN=http://frontend:5173
PORT=4001
LOG_LEVEL=debug
```

With the example above (`ENVIRONMENT=dev`, `APP_NAME=website`), Docker container names become:

- `dev-website`
- `dev-website-migrate`
- `dev-website-seed`
- `dev-mydb-db`

Prefix consistency rule:

- Keep one `ENVIRONMENT` value per deployed stack.
- Do not mix prefixes (`dev-...` and `prod-...`) for services that must work together.

### Production

```bash
ENVIRONMENT=prod
NODE_ENV=production
DATABASE_HOST=prod-db-master.internal
DATABASE=prod_app_db
DATABASE_USERNAME=prod_user
DATABASE_PASSWORD=<secure-random-password>
JWT_KEY=<secure-random-key-64-hex-chars>
AUTH_STRATEGIES=jwt,api-key
CORS_ORIGIN=https://example.com,https://app.example.com
PORT=8080
LOG_LEVEL=warn
FEATURE_MAILER=true
MAILER_DRIVER=smtp
MAILER_SMTP_HOST=smtp.sendgrid.net
MAILER_SMTP_PORT=587
MAILER_SMTP_SECURE=false
MAILER_SMTP_USER=apikey
MAILER_SMTP_PASSWORD=<sendgrid-api-key>
```

---

## Validation & Error Handling

### Strict Validation on Startup

The application validates all environment variables on startup. If validation fails, the app will **fail fast** with detailed error messages.

**Required variables that cause failure:**

- `DATABASE_HOST`, `DATABASE`, `DATABASE_USERNAME`, `DATABASE_PASSWORD` — Always required.
- `JWT_KEY` — Required if `AUTH_STRATEGIES` includes `jwt`.
- Additional requirements based on feature flags and drivers.

**Example error:**

```
Error: DATABASE_PASSWORD is required
  at config.ts:... (line number)
```

### Where to Check

See `backend/src/helpers/config/config.ts` for the full validation schema and logic.

---

## Tips & Best Practices

1. **Never commit `.env` file** — It contains secrets. Only commit `.env.example`.
2. **Generate secure keys** — Use `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` for `JWT_KEY`.
3. **Use .env.example as reference** — Copy and modify as needed.
4. **Document custom variables** — If you add new env variables, update this file.
5. **Test connectivity** — After setting `DATABASE_*` variables, run `npm run db:migrate` to verify connection.
6. **Feature flags** — Start with defaults, enable only what you need.
7. **For production** — Use a secrets management tool (HashiCorp Vault, AWS Secrets Manager, etc.) instead of .env files.
