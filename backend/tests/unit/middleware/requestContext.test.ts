import { requestContextMiddleware } from "@src/middleware/observability/requestContext";
import { NextFunction, Request, Response } from "express";

describe("requestContextMiddleware", () => {
  it("uses the x-request-id header value when present", () => {
    const req = {
      header: jest.fn().mockReturnValue("my-request-id"),
    } as unknown as Request;
    const res = { setHeader: jest.fn() } as unknown as Response;
    const next = jest.fn() as NextFunction;

    requestContextMiddleware(req, res, next);

    expect(req.requestId).toBe("my-request-id");
    expect(res.setHeader).toHaveBeenCalledWith("x-request-id", "my-request-id");
    expect(next).toHaveBeenCalled();
  });

  it("generates a UUID when the request-id header is absent", () => {
    const req = {
      header: jest.fn().mockReturnValue(undefined),
    } as unknown as Request;
    const res = { setHeader: jest.fn() } as unknown as Response;
    const next = jest.fn() as NextFunction;

    requestContextMiddleware(req, res, next);

    expect(req.requestId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
    );
    expect(res.setHeader).toHaveBeenCalledWith(
      "x-request-id",
      req.requestId as string,
    );
    expect(next).toHaveBeenCalled();
  });

  it("generates different UUIDs for different requests", () => {
    const makeReq = () =>
      ({ header: jest.fn().mockReturnValue(undefined) }) as unknown as Request;
    const res = { setHeader: jest.fn() } as unknown as Response;
    const next = jest.fn() as NextFunction;

    const req1 = makeReq();
    const req2 = makeReq();

    requestContextMiddleware(req1, res, next);
    requestContextMiddleware(req2, res, next);

    expect(req1.requestId).not.toBe(req2.requestId);
  });
});
