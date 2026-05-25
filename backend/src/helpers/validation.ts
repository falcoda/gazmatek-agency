import { ValidationError } from "@src/helpers/error/errors";
import { NextFunction, Request, RequestHandler, Response } from "express";
import { z } from "zod";

type RequestSchema = {
  body?: z.ZodType<unknown>;
  query?: z.ZodType<unknown>;
  params?: z.ZodType<unknown>;
};

const formatZodError = (error: z.ZodError) =>
  error.issues.map((issue) => ({
    path: issue.path.join("."),
    message: issue.message,
  }));

export const validateRequest = (schema: RequestSchema): RequestHandler => {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (schema.body) {
        req.body = schema.body.parse(req.body);
      }

      if (schema.query) {
        const parsedQuery = schema.query.parse(req.query) as Request["query"];
        Object.defineProperty(req, "query", {
          value: parsedQuery,
          writable: true,
          configurable: true,
        });
      }

      if (schema.params) {
        const parsedParams = schema.params.parse(
          req.params,
        ) as Request["params"];
        Object.defineProperty(req, "params", {
          value: parsedParams,
          writable: true,
          configurable: true,
        });
      }

      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        next(
          new ValidationError(
            "Request validation failed",
            formatZodError(error),
          ),
        );
        return;
      }

      next(error);
    }
  };
};
