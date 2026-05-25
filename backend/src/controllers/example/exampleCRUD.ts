import {
  CreateExampleBody,
  CreateExampleResponse,
  DeleteExampleBody,
  DeleteExampleResponse,
  ExampleQuery,
  GetExampleByIdResponse,
  ListExampleResponse,
  UpdateExampleBody,
  UpdateExampleResponse,
} from "@src/controllers/example/types";
import { logger } from "@src/helpers/logger";
import { EXAMPLE_SUCCESS_MESSAGES } from "@src/helpers/messages";
import ExampleService from "@src/services/example/exampleService";
import { NextFunction, Request, Response } from "express";

/**
 * Template-only CRUD controller used as a reference implementation.
 */
export class ExampleCRUD {
  constructor(private exampleService: ExampleService) {}

  async add(
    req: Request<Record<string, never>, unknown, CreateExampleBody>,
    res: Response<CreateExampleResponse>,
    next: NextFunction,
  ): Promise<void> {
    try {
      const example = await this.exampleService.createExample(req.body);

      logger.info("Example created", { example });
      res
        .status(201)
        .json({ message: EXAMPLE_SUCCESS_MESSAGES.CREATED, example });
    } catch (error) {
      next(error);
    }
  }

  async getById(
    req: Request<Record<string, never>, unknown, never, ExampleQuery>,
    res: Response<GetExampleByIdResponse>,
    next: NextFunction,
  ): Promise<void> {
    try {
      const example = await this.exampleService.getById(req.query.example_id!);
      res.status(200).json(example);
    } catch (error) {
      next(error);
    }
  }

  async list(
    req: Request<
      Record<string, never>,
      unknown,
      never,
      { page?: string; limit?: string }
    >,
    res: Response<ListExampleResponse>,
    next: NextFunction,
  ): Promise<void> {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Math.min(Number(req.query.limit) || 20, 100);
      const result = await this.exampleService.list(page, limit);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async update(
    req: Request<Record<string, never>, unknown, UpdateExampleBody>,
    res: Response<UpdateExampleResponse>,
    next: NextFunction,
  ): Promise<void> {
    try {
      const example = await this.exampleService.updateExample(req.body);

      logger.info("Example updated", { example });
      res
        .status(200)
        .json({ message: EXAMPLE_SUCCESS_MESSAGES.UPDATED, example });
    } catch (error) {
      next(error);
    }
  }

  async delete(
    req: Request<Record<string, never>, unknown, DeleteExampleBody>,
    res: Response<DeleteExampleResponse>,
    next: NextFunction,
  ): Promise<void> {
    try {
      const example = await this.exampleService.deleteExample(req.body);

      logger.info("Example deleted", { example });
      res
        .status(200)
        .json({ message: EXAMPLE_SUCCESS_MESSAGES.DELETED, example });
    } catch (error) {
      next(error);
    }
  }
}

export default ExampleCRUD;
