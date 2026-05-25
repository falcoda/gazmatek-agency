jest.mock("@src/helpers/logger", () => ({
  logger: { info: jest.fn(), error: jest.fn() },
}));

import { HealthController } from "@src/controllers/health/healthController";
import type { NextFunction, Request, Response } from "express";
import type { Pool } from "pg";

const makeRes = () => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as Response;
};

describe("HealthController", () => {
  const mockPool = {
    query: jest.fn().mockResolvedValue({ rows: [{ ready: 1 }] }),
  } as unknown as Pool;

  const controller = new HealthController(mockPool);
  const next = jest.fn() as NextFunction;

  afterEach(() => jest.clearAllMocks());

  describe("live()", () => {
    it("returns 200 with status alive", () => {
      const req = { requestId: "live-id" } as unknown as Request;
      const res = makeRes();

      controller.live(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "alive",
          service: "backend-template-test",
        }),
      );
    });

    it("includes uptime_seconds and timestamp", () => {
      const req = {} as Request;
      const res = makeRes();

      controller.live(req, res);

      const body = (res.json as jest.Mock).mock.calls[0][0] as Record<
        string,
        unknown
      >;

      expect(typeof body.uptime_seconds).toBe("number");
      expect(typeof body.timestamp).toBe("string");
    });
  });

  describe("ready()", () => {
    it("returns 200 with database checks on success", async () => {
      const req = {} as Request;
      const res = makeRes();

      await controller.ready(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "ready",
          checks: expect.objectContaining({
            database: true,
          }),
        }),
      );
      expect(next).not.toHaveBeenCalled();
    });

    it("calls next(serviceUnavailableError) when the DB query fails", async () => {
      const failPool = {
        query: jest.fn().mockRejectedValue(new Error("db down")),
      } as unknown as Pool;
      const failController = new HealthController(failPool);
      const res = makeRes();

      await failController.ready({} as Request, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 503,
          message: "Service is not ready",
        }),
      );
      expect(res.status).not.toHaveBeenCalled();
    });

    it("reflects a true database check when SELECT 1 returns 1", async () => {
      const req = {} as Request;
      const res = makeRes();

      await controller.ready(req, res, next);

      const body = (res.json as jest.Mock).mock.calls[0][0] as {
        checks: { database: boolean };
      };

      expect(body.checks.database).toBe(true);
    });
  });

  describe("details()", () => {
    it("returns 200 with config flags", async () => {
      const req = { requestId: "detail-id" } as unknown as Request;
      const res = makeRes();

      await controller.details(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          service: "backend-template-test",
          request_id: "detail-id",
        }),
      );
    });
  });
});
