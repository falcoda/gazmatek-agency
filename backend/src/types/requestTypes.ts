import { AuthStrategy } from "@src/types/config";
import { JwtPayload } from "jsonwebtoken";

export interface AuthenticatedUser {
  id: number | string;
  email?: string;
  authType: AuthStrategy;
}

export interface AuthTokenPayload extends JwtPayload {
  data: string;
}

declare module "express-serve-static-core" {
  interface Request {
    user?: AuthenticatedUser;
    user_id?: number;
    email?: string;
    requestId?: string;
    // Raw request body captured by express.json verify callback. Used for
    // HMAC signature verification on incoming webhooks (e.g. Documenso).
    rawBody?: string;
  }
}
