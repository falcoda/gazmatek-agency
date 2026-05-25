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
  }
}
