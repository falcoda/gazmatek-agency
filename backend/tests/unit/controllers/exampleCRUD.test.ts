jest.mock("@src/helpers/logger", () => ({
  logger: { info: jest.fn() },
}));

import { ExampleCRUD } from "@src/controllers/example/exampleCRUD";
import ExampleService from "@src/services/example/exampleService";
import type { NextFunction, Response } from "express";

const makeRes = () => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as Response;
};

const makeMockService = (): jest.Mocked<ExampleService> =>
  ({
    createExample: jest.fn(),
    getById: jest.fn(),
    list: jest.fn(),
    updateExample: jest.fn(),
    deleteExample: jest.fn(),
  }) as unknown as jest.Mocked<ExampleService>;

describe("ExampleCRUD", () => {
  let mockService: jest.Mocked<ExampleService>;
  let crud: ExampleCRUD;
  const next = jest.fn() as NextFunction;

  beforeEach(() => {
    mockService = makeMockService();
    crud = new ExampleCRUD(mockService);
  });

  afterEach(() => jest.clearAllMocks());

  // ── add ──────────────────────────────────────────────────────────────────

  describe("add()", () => {
    it("returns 201 with the created example", async () => {
      const created = {
        example_id: 1,
        name: "test",
        description: null,
        created_at: new Date(),
      };
      mockService.createExample.mockResolvedValue(created);

      const req = { body: { name: "test" } } as unknown as Parameters<
        typeof crud.add
      >[0];
      const res = makeRes();

      await crud.add(req, res, next);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "example added successfully",
          example: created,
        }),
      );
      expect(next).not.toHaveBeenCalled();
    });

    it("calls next(error) when the service throws", async () => {
      mockService.createExample.mockRejectedValue(new Error("db error"));
      const req = { body: { name: "test" } } as unknown as Parameters<
        typeof crud.add
      >[0];

      await crud.add(req, makeRes(), next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  // ── getById ──────────────────────────────────────────────────────────────

  describe("getById()", () => {
    it("returns 200 with the example matching the id", async () => {
      const item = {
        example_id: 42,
        name: "example",
        description: "desc",
        created_at: new Date(),
      };
      mockService.getById.mockResolvedValue(item);

      const req = { query: { example_id: "42" } } as unknown as Parameters<
        typeof crud.getById
      >[0];
      const res = makeRes();

      await crud.getById(req, res, next);

      expect(mockService.getById).toHaveBeenCalledWith("42");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(item);
      expect(next).not.toHaveBeenCalled();
    });

    it("calls next(error) when the service throws", async () => {
      mockService.getById.mockRejectedValue(new Error("not found"));
      const req = { query: { example_id: "1" } } as unknown as Parameters<
        typeof crud.getById
      >[0];

      await crud.getById(req, makeRes(), next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  // ── list ─────────────────────────────────────────────────────────────────

  describe("list()", () => {
    const paginatedResult = {
      data: [
        {
          example_id: 1,
          name: "example",
          description: "desc",
          created_at: new Date(),
        },
      ],
      pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
    };

    it("returns 200 with paginated examples", async () => {
      mockService.list.mockResolvedValue(paginatedResult);

      const req = { query: {} } as unknown as Parameters<typeof crud.list>[0];
      const res = makeRes();

      await crud.list(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(paginatedResult);
      expect(next).not.toHaveBeenCalled();
    });

    it("passes page and limit from query params", async () => {
      mockService.list.mockResolvedValue(paginatedResult);

      const req = {
        query: { page: "2", limit: "10" },
      } as unknown as Parameters<typeof crud.list>[0];

      await crud.list(req, makeRes(), next);

      expect(mockService.list).toHaveBeenCalledWith(2, 10);
    });

    it("uses defaults when page and limit are missing", async () => {
      mockService.list.mockResolvedValue(paginatedResult);

      const req = { query: {} } as unknown as Parameters<typeof crud.list>[0];

      await crud.list(req, makeRes(), next);

      expect(mockService.list).toHaveBeenCalledWith(1, 20);
    });

    it("clamps limit to 100", async () => {
      mockService.list.mockResolvedValue(paginatedResult);

      const req = { query: { limit: "999" } } as unknown as Parameters<
        typeof crud.list
      >[0];

      await crud.list(req, makeRes(), next);

      expect(mockService.list).toHaveBeenCalledWith(1, 100);
    });

    it("calls next(error) when the service throws", async () => {
      mockService.list.mockRejectedValue(new Error("db error"));
      const req = { query: {} } as unknown as Parameters<typeof crud.list>[0];

      await crud.list(req, makeRes(), next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  // ── update ────────────────────────────────────────────────────────────────

  describe("update()", () => {
    it("returns 200 with the updated example", async () => {
      const updated = { example_id: 1, name: "updated", description: null };
      mockService.updateExample.mockResolvedValue(updated);

      const req = {
        body: { example_id: 1, name: "updated" },
      } as unknown as Parameters<typeof crud.update>[0];
      const res = makeRes();

      await crud.update(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "example updated successfully",
          example: updated,
        }),
      );
      expect(next).not.toHaveBeenCalled();
    });

    it("calls next(error) when the service throws", async () => {
      mockService.updateExample.mockRejectedValue(new Error("update failed"));
      const req = { body: { example_id: 1 } } as unknown as Parameters<
        typeof crud.update
      >[0];

      await crud.update(req, makeRes(), next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  // ── delete ────────────────────────────────────────────────────────────────

  describe("delete()", () => {
    it("returns 200 with the deleted example id", async () => {
      const deleted = { example_id: 99 };
      mockService.deleteExample.mockResolvedValue(deleted);

      const req = { body: { example_id: 99 } } as unknown as Parameters<
        typeof crud.delete
      >[0];
      const res = makeRes();

      await crud.delete(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "example deleted successfully",
          example: deleted,
        }),
      );
      expect(next).not.toHaveBeenCalled();
    });

    it("calls next(error) when the service throws", async () => {
      mockService.deleteExample.mockRejectedValue(new Error("delete failed"));
      const req = { body: { example_id: 1 } } as unknown as Parameters<
        typeof crud.delete
      >[0];

      await crud.delete(req, makeRes(), next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });
});
