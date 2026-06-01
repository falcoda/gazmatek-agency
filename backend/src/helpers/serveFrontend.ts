import { config } from "@src/helpers/config";
import { API_PREFIX, FRONTEND_INDEX_FILE } from "@src/helpers/constants";
import { logger } from "@src/helpers/logger";
import express, { Express, NextFunction, Request, Response } from "express";
import fs from "fs";
import path from "path";

// Path prefixes owned by the backend. Requests under these must never fall back
// to the SPA so unknown API/docs/metrics routes still yield a proper JSON 404.
const backendPathPrefixes = (): string[] =>
  [API_PREFIX, config.docs.path, config.docs.jsonPath, config.metrics.path]
    .filter(Boolean)
    .map((prefix) => prefix.replace(/\/+$/, ""));

const isBackendPath = (requestPath: string): boolean =>
  backendPathPrefixes().some(
    (prefix) => requestPath === prefix || requestPath.startsWith(`${prefix}/`),
  );

// Resolve the frontend build directory. An explicit directory wins; otherwise
// probe locations relative to the process working directory so the same binary
// works across environments:
// - local dev: backend cwd -> ../frontend/build
// - monorepo root cwd -> frontend/build
// - PROD deploy: the CI copies the frontend build to <REPO_PATH>/build, and the
//   container runs with cwd = REPO_PATH, so the build sits at ./build
//   (see .github/workflows/deploiement-runner.yml).
const resolveFrontendDir = (buildDir?: string): string | null => {
  const candidates = [
    buildDir,
    path.resolve(process.cwd(), "..", "frontend", "build"),
    path.resolve(process.cwd(), "frontend", "build"),
    path.resolve(process.cwd(), "build"),
  ].filter((candidate): candidate is string => Boolean(candidate));

  for (const candidate of candidates) {
    if (fs.existsSync(path.join(candidate, FRONTEND_INDEX_FILE))) {
      return candidate;
    }
  }

  return null;
};

// Serve the built single-page application from the same origin as the API.
// Hashed assets are served statically; every other (non-backend) GET/HEAD
// request returns index.html so client-side routing can take over. When the
// build is missing the backend stays API-only and logs a warning.
export const serveFrontend = (app: Express, buildDir?: string): void => {
  const frontendDir = resolveFrontendDir(buildDir);

  if (!frontendDir) {
    logger.warn("Frontend build not found; serving API only", {
      cwd: process.cwd(),
    });
    return;
  }

  const indexFile = path.join(frontendDir, FRONTEND_INDEX_FILE);

  // index: false so the SPA fallback below owns "/" and unknown client routes.
  app.use(express.static(frontendDir, { index: false }));

  app.use((req: Request, res: Response, next: NextFunction): void => {
    if (req.method !== "GET" && req.method !== "HEAD") {
      next();
      return;
    }

    if (isBackendPath(req.path)) {
      next();
      return;
    }

    res.sendFile(indexFile, (error) => {
      if (error) {
        next(error);
      }
    });
  });

  logger.info("Serving frontend build", { frontendDir });
};
