import {
  ForgotPasswordBody,
  ForgotPasswordResponse,
  LoginBody,
  LoginResponse,
  LogoutResponse,
  RefreshBody,
  RefreshResponse,
  RegisterBody,
  RegisterResponse,
  ResetPasswordBody,
  ResetPasswordResponse,
} from "@src/controllers/auth/types";
import { logger } from "@src/helpers/logger";
import { AUTH_SUCCESS_MESSAGES } from "@src/helpers/messages";
import AuthService from "@src/services/auth/authService";
import { NextFunction, Request, Response } from "express";

export class AuthCRUD {
  constructor(private authService: AuthService) {}

  async register(
    req: Request<Record<string, never>, unknown, RegisterBody>,
    res: Response<RegisterResponse>,
    next: NextFunction,
  ): Promise<void> {
    try {
      const result = await this.authService.register(req.body);

      logger.info("User registered", { email: req.body.email });
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async login(
    req: Request<Record<string, never>, unknown, LoginBody>,
    res: Response<LoginResponse>,
    next: NextFunction,
  ): Promise<void> {
    try {
      const result = await this.authService.login(req.body);

      logger.info("User logged in", { email: req.body.email });
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async refresh(
    req: Request<Record<string, never>, unknown, RefreshBody>,
    res: Response<RefreshResponse>,
    next: NextFunction,
  ): Promise<void> {
    try {
      const tokens = await this.authService.refresh(req.body.refreshToken);
      res.status(200).json(tokens);
    } catch (error) {
      next(error);
    }
  }

  async logout(
    req: Request<Record<string, never>, unknown, RefreshBody>,
    res: Response<LogoutResponse>,
    next: NextFunction,
  ): Promise<void> {
    try {
      await this.authService.logout(req.body.refreshToken);

      logger.info("User logged out", { user_id: req.user_id });
      res.status(200).json({ message: AUTH_SUCCESS_MESSAGES.LOGGED_OUT });
    } catch (error) {
      next(error);
    }
  }

  async forgotPassword(
    req: Request<Record<string, never>, unknown, ForgotPasswordBody>,
    res: Response<ForgotPasswordResponse>,
    next: NextFunction,
  ): Promise<void> {
    try {
      await this.authService.forgotPassword(req.body);

      res
        .status(200)
        .json({ message: AUTH_SUCCESS_MESSAGES.PASSWORD_RESET_REQUESTED });
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(
    req: Request<Record<string, never>, unknown, ResetPasswordBody>,
    res: Response<ResetPasswordResponse>,
    next: NextFunction,
  ): Promise<void> {
    try {
      await this.authService.resetPassword(req.body);

      logger.info("User password reset");
      res.status(200).json({ message: AUTH_SUCCESS_MESSAGES.PASSWORD_RESET });
    } catch (error) {
      next(error);
    }
  }
}

export default AuthCRUD;
