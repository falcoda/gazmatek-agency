jest.mock("@src/helpers/logger", () => ({
  logger: { info: jest.fn() },
}));

import { logger } from "@src/helpers/logger";
import { requestLoggerMiddleware } from "@src/middleware/observability/requestLogger";
import { NextFunction, Request, Response } from "express";

describe("requestLoggerMiddleware", () => {
  afterEach(() => jest.clearAllMocks());

  const makeRes = (statusCode = 200) => {
    let finishHandler: (() => void) | undefined;
    const res = {
      statusCode,
      on: jest.fn((event: string, handler: () => void) => {
        if (event === "finish") finishHandler = handler;
      }),
      triggerFinish: () => finishHandler?.(),
    };
    return res as unknown as Response & { triggerFinish: () => void };
  };

  it("calls next immediately", () => {
    const req = {
      requestId: "id-1",
      method: "GET",
      originalUrl: "/api/health/live",
      path: "/api/health/live",
    } as unknown as Request;
    const res = makeRes();
    const next = jest.fn() as NextFunction;

    requestLoggerMiddleware(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it("does not log requests for hashed frontend assets", () => {
    const req = {
      requestId: "asset-id",
      method: "GET",
      originalUrl: "/assets/index-MAXsLawZ.js",
      path: "/assets/index-MAXsLawZ.js",
    } as unknown as Request;
    const res = makeRes(200);
    const next = jest.fn() as NextFunction;

    requestLoggerMiddleware(req, res, next);
    (res as unknown as { triggerFinish: () => void }).triggerFinish();

    expect(next).toHaveBeenCalled();
    expect(res.on).not.toHaveBeenCalled();
    expect(logger.info).not.toHaveBeenCalled();
  });

  it("logs the request after the response finishes", () => {
    const req = {
      requestId: "test-req-id",
      method: "GET",
      originalUrl: "/api/health/live",
      path: "/api/health/live",
    } as unknown as Request;
    const res = makeRes(200);

    requestLoggerMiddleware(req, res, jest.fn() as NextFunction);
    (res as unknown as { triggerFinish: () => void }).triggerFinish();

    expect(logger.info).toHaveBeenCalledWith(
      "HTTP request completed",
      expect.objectContaining({
        request_id: "test-req-id",
        method: "GET",
        path: "/api/health/live",
        status_code: 200,
      }),
    );
  });

  it("includes a numeric duration_ms in the log entry", () => {
    const req = {
      requestId: "dur-id",
      method: "POST",
      originalUrl: "/api/example",
      path: "/api/example",
    } as unknown as Request;
    const res = makeRes(201);

    requestLoggerMiddleware(req, res, jest.fn() as NextFunction);
    (res as unknown as { triggerFinish: () => void }).triggerFinish();

    const logArgs = (logger.info as jest.Mock).mock.calls[0][1] as {
      duration_ms: number;
    };
    expect(typeof logArgs.duration_ms).toBe("number");
    expect(logArgs.duration_ms).toBeGreaterThanOrEqual(0);
  });
});
