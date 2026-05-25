import { ValidationError } from "@src/helpers/error/errors";
import { validateRequest } from "@src/helpers/validation";
import { NextFunction, Request, Response } from "express";
import { z } from "zod";

describe("validateRequest middleware", () => {
  const res = {} as Response;

  it("calls next() with no argument when body passes the schema", () => {
    const req = {
      body: { name: "Alice" },
      query: {},
      params: {},
    } as unknown as Request;
    const next = jest.fn() as NextFunction;

    validateRequest({ body: z.object({ name: z.string() }) })(req, res, next);

    expect(next).toHaveBeenCalledWith();
  });

  it("calls next(ValidationError) when body fails the schema", () => {
    const req = {
      body: {},
      query: {},
      params: {},
    } as unknown as Request;
    const next = jest.fn() as NextFunction;

    validateRequest({ body: z.object({ name: z.string() }) })(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
  });

  it('sets error message to "Request validation failed"', () => {
    const req = {
      body: {},
      query: {},
      params: {},
    } as unknown as Request;
    const next = jest.fn() as NextFunction;

    validateRequest({ body: z.object({ name: z.string() }) })(req, res, next);

    const err = (next as jest.Mock).mock.calls[0][0] as ValidationError;
    expect(err.message).toBe("Request validation failed");
  });

  it("formats Zod errors as an array of { path, message } objects", () => {
    const req = {
      body: { name: "" },
      query: {},
      params: {},
    } as unknown as Request;
    const next = jest.fn() as NextFunction;

    validateRequest({ body: z.object({ name: z.string().min(1) }) })(
      req,
      res,
      next,
    );

    const err = (next as jest.Mock).mock.calls[0][0] as ValidationError;
    const details = err.details as Array<{ path: string; message: string }>;
    expect(Array.isArray(details)).toBe(true);
    expect(details[0]).toHaveProperty("path");
    expect(details[0]).toHaveProperty("message");
  });

  it("validates query params and calls next(ValidationError) on failure", () => {
    const req = {
      body: {},
      query: {},
      params: {},
    } as unknown as Request;
    const next = jest.fn() as NextFunction;

    validateRequest({ query: z.object({ page: z.string() }) })(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
  });

  it("mutates req.body with the coerced parsed value on success", () => {
    const req = {
      body: { count: "5" },
      query: {},
      params: {},
    } as unknown as Request;
    const next = jest.fn() as NextFunction;

    validateRequest({
      body: z.object({ count: z.coerce.number() }),
    })(req, res, next);

    expect((req.body as { count: number }).count).toBe(5);
    expect(next).toHaveBeenCalledWith();
  });

  it("validates params and calls next(ValidationError) on failure", () => {
    const req = {
      body: {},
      query: {},
      params: {},
    } as unknown as Request;
    const next = jest.fn() as NextFunction;

    validateRequest({ params: z.object({ id: z.string().min(1) }) })(
      req,
      res,
      next,
    );

    expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
  });
});
