import { getUserByApiKey } from "@src/db/query/auth/getUserByApiKey.types";
import { config } from "@src/helpers/config";
import { AUTH_HEADERS } from "@src/helpers/constants";
import { ERROR_MESSAGES } from "@src/helpers/error/constants";
import { UnauthorizedError } from "@src/helpers/error/errors";
import { AUTH_STRATEGY } from "@src/types/config";
import { AuthenticatedUser } from "@src/types/requestTypes";
import { Request } from "express";
import { Pool } from "pg";

const extractApiKey = (req: Request): string | null => {
  const headerName = config.auth.apiKeyHeader.toLowerCase();
  const directHeader = req.headers[headerName];

  if (typeof directHeader === "string" && directHeader.trim()) {
    return directHeader.trim();
  }

  const authorization = req.headers.authorization;
  if (authorization && authorization.startsWith(AUTH_HEADERS.API_KEY_PREFIX)) {
    return authorization.slice(AUTH_HEADERS.API_KEY_PREFIX.length).trim();
  }

  return null;
};

export const authenticateWithApiKey = async (
  req: Request,
  client: Pool,
): Promise<AuthenticatedUser | null> => {
  const apiKey = extractApiKey(req);

  if (!apiKey) {
    return null;
  }

  let rows;

  try {
    rows = await getUserByApiKey.run({ apiKey }, client);
  } catch {
    throw new UnauthorizedError(ERROR_MESSAGES.UNAUTHORIZED);
  }

  if (rows.length === 0) {
    throw new UnauthorizedError(ERROR_MESSAGES.UNAUTHORIZED);
  }

  return {
    id: rows[0].user_id,
    email: rows[0].email,
    authType: AUTH_STRATEGY.API_KEY,
  };
};
