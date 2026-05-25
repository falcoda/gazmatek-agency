# Docker Stack

This folder contains the local Docker Compose stack for the project.

## Start

```bash
cd docker
cp .env.example .env
docker compose up -d db
docker compose run --rm migrate
docker compose up -d website
```

> Seeds are dev-only demo data and are **not** part of the Docker stack.
> They never run on `docker compose up`. To load demo data locally, run
> `npm run db:seed` from `backend/` against your local database.

## Services

| Service   | Description                              |
| --------- | ---------------------------------------- |
| `db`      | PostgreSQL (`postgres:17`)               |
| `migrate` | One-shot migration job                   |
| `seed`    | One-shot seed job (dev only, run manually) |
| `website` | Node.js API on `http://localhost:4001`   |
| `minio`   | S3-compatible storage — opt-in: `--profile s3` |

## Workflow

1. **Start the database**

   ```bash
   docker compose up -d db
   ```

   The `db` service has a healthcheck; wait until it reports healthy.

2. **Run migrations**

   ```bash
   docker compose run --rm migrate
   ```

   The `migrate` service is a one-shot job that applies SQL migrations and
   exits.

3. **Start the application**

   ```bash
   docker compose up -d website
   ```

   The `website` service depends on `db` being healthy and `migrate`
   completing successfully.

## Optional: S3 storage (MinIO)

The stack bundles a [MinIO](https://min.io) server — an S3-compatible object
store — for using the `s3` storage driver locally. It is **opt-in** through the
`s3` Compose profile, so a plain `docker compose up` never starts it.

```bash
docker compose --profile s3 up -d
```

To use it:

1. In `.env`, set `STORAGE_DRIVER=s3` and uncomment the `STORAGE_S3_*` block.
2. MinIO root credentials are taken from `STORAGE_S3_ACCESS_KEY` /
   `STORAGE_S3_SECRET_KEY` (the secret must be at least 8 characters).
3. Use `http://minio:9000` as the endpoint from inside the Docker network, or
   `http://localhost:9000` from the host.

The web console runs at `http://localhost:9001`. The backend's S3 driver
creates the bucket automatically on first use. MinIO data persists under
`docker/data/minio`.

## Notes

- All services are configured through `docker/.env`. Copy `.env.example`
  to `.env` and adjust the values before starting the stack.
- The PostgreSQL data volume persists under `docker/data/postgres`.
- An initialization SQL file is mounted from `docker/db/myDB.sql`.
- Container names are prefixed with `ENVIRONMENT` and built from `APP_NAME`
  / `DATABASE`, so they vary between `dev`, `staging`, and `prod`.
