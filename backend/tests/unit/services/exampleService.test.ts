// Mock all pgtyped query modules before importing the service
jest.mock("@src/db/query/example/createExample.types", () => ({
  createExample: { run: jest.fn() },
}));
jest.mock("@src/db/query/example/getExampleById.types", () => ({
  getExampleById: { run: jest.fn() },
}));
jest.mock("@src/db/query/example/listExamples.types", () => ({
  listExamples: { run: jest.fn() },
}));
jest.mock("@src/db/query/example/countExamples.types", () => ({
  countExamples: { run: jest.fn() },
}));
jest.mock("@src/db/query/example/updateExample.types", () => ({
  updateExample: { run: jest.fn() },
}));
jest.mock("@src/db/query/example/deleteExample.types", () => ({
  deleteExample: { run: jest.fn() },
}));

import { countExamples } from "@src/db/query/example/countExamples.types";
import { createExample } from "@src/db/query/example/createExample.types";
import { deleteExample } from "@src/db/query/example/deleteExample.types";
import { getExampleById } from "@src/db/query/example/getExampleById.types";
import { listExamples } from "@src/db/query/example/listExamples.types";
import { updateExample } from "@src/db/query/example/updateExample.types";
import { DatabaseError, NotFoundError } from "@src/helpers/error/errors";
import { ExampleService } from "@src/services/example/exampleService";
import { Pool } from "pg";

const mockCreateExample = createExample as jest.Mocked<typeof createExample>;
const mockGetExampleById = getExampleById as jest.Mocked<typeof getExampleById>;
const mockListExamples = listExamples as jest.Mocked<typeof listExamples>;
const mockCountExamples = countExamples as jest.Mocked<typeof countExamples>;
const mockUpdateExample = updateExample as jest.Mocked<typeof updateExample>;
const mockDeleteExample = deleteExample as jest.Mocked<typeof deleteExample>;

describe("ExampleService", () => {
  let service: ExampleService;
  const mockPool = {} as Pool;

  beforeEach(() => {
    service = new ExampleService(mockPool);
    jest.clearAllMocks();
  });

  // ── createExample ─────────────────────────────────────────────────────────

  describe("createExample()", () => {
    it("returns the created example", async () => {
      const dbRow = {
        example_id: "1",
        name: "Test",
        description: "A description",
        created_at: new Date("2024-01-01"),
      };
      (mockCreateExample.run as jest.Mock).mockResolvedValue([dbRow]);

      const result = await service.createExample({
        name: "Test",
        description: "A description",
      });

      expect(result).toEqual({
        example_id: 1,
        name: "Test",
        description: "A description",
        created_at: dbRow.created_at,
      });
    });

    it("handles null description", async () => {
      (mockCreateExample.run as jest.Mock).mockResolvedValue([
        {
          example_id: "2",
          name: "No desc",
          description: null,
          created_at: new Date(),
        },
      ]);

      const result = await service.createExample({ name: "No desc" });

      expect(result.description).toBeNull();
    });

    it("throws DatabaseError when DB returns no rows", async () => {
      (mockCreateExample.run as jest.Mock).mockResolvedValue([]);

      await expect(
        service.createExample({ name: "Test" }),
      ).rejects.toBeInstanceOf(DatabaseError);
    });
  });

  // ── getById ───────────────────────────────────────────────────────────────

  describe("getById()", () => {
    it("returns the example with matching id", async () => {
      const now = new Date();
      (mockGetExampleById.run as jest.Mock).mockResolvedValue([
        {
          example_id: "42",
          name: "Example",
          description: "desc",
          created_at: now,
        },
      ]);

      const result = await service.getById("42");

      expect(result).toEqual({
        example_id: 42,
        name: "Example",
        description: "desc",
        created_at: now,
      });
    });

    it("throws NotFoundError when no row is returned", async () => {
      (mockGetExampleById.run as jest.Mock).mockResolvedValue([]);

      await expect(service.getById("999")).rejects.toBeInstanceOf(
        NotFoundError,
      );
    });

    it("is not an array", async () => {
      (mockGetExampleById.run as jest.Mock).mockResolvedValue([
        {
          example_id: "1",
          name: "x",
          description: null,
          created_at: new Date(),
        },
      ]);

      const result = await service.getById("1");

      expect(Array.isArray(result)).toBe(false);
    });
  });

  // ── list ──────────────────────────────────────────────────────────────────

  describe("list()", () => {
    it("returns paginated examples with correct metadata", async () => {
      const rows = [
        {
          example_id: "1",
          name: "A",
          description: null,
          created_at: new Date(),
        },
        {
          example_id: "2",
          name: "B",
          description: "desc",
          created_at: new Date(),
        },
      ];
      (mockListExamples.run as jest.Mock).mockResolvedValue(rows);
      (mockCountExamples.run as jest.Mock).mockResolvedValue([{ total: 2 }]);

      const result = await service.list(1, 20);

      expect(result.data).toHaveLength(2);
      expect(result.data[0]).toHaveProperty("example_id", 1);
      expect(result.pagination).toEqual({
        page: 1,
        limit: 20,
        total: 2,
        totalPages: 1,
      });
    });

    it("calculates correct offset for page 2", async () => {
      (mockListExamples.run as jest.Mock).mockResolvedValue([]);
      (mockCountExamples.run as jest.Mock).mockResolvedValue([{ total: 50 }]);

      await service.list(2, 10);

      expect(mockListExamples.run).toHaveBeenCalledWith(
        { limit: 10, offset: 10 },
        mockPool,
      );
    });

    it("computes totalPages correctly", async () => {
      (mockListExamples.run as jest.Mock).mockResolvedValue([]);
      (mockCountExamples.run as jest.Mock).mockResolvedValue([{ total: 25 }]);

      const result = await service.list(1, 10);

      expect(result.pagination.totalPages).toBe(3);
    });
  });

  // ── updateExample ─────────────────────────────────────────────────────────

  describe("updateExample()", () => {
    it("returns the updated example", async () => {
      (mockUpdateExample.run as jest.Mock).mockResolvedValue([
        {
          example_id: "5",
          name: "Updated",
          description: null,
          created_at: new Date(),
        },
      ]);

      const result = await service.updateExample({
        example_id: 5,
        name: "Updated",
      });

      expect(result).toEqual({
        example_id: 5,
        name: "Updated",
        description: null,
      });
    });

    it("throws NotFoundError when no row is returned", async () => {
      (mockUpdateExample.run as jest.Mock).mockResolvedValue([]);

      await expect(
        service.updateExample({ example_id: 999, name: "x" }),
      ).rejects.toBeInstanceOf(NotFoundError);
    });

    it("handles string example_id", async () => {
      (mockUpdateExample.run as jest.Mock).mockResolvedValue([
        {
          example_id: "456",
          name: "Updated",
          description: null,
          created_at: new Date(),
        },
      ]);

      const result = await service.updateExample({
        example_id: "456",
        name: "Updated",
      });

      expect(result.example_id).toBe(456);
    });
  });

  // ── deleteExample ─────────────────────────────────────────────────────────

  describe("deleteExample()", () => {
    it("returns the deleted example_id", async () => {
      (mockDeleteExample.run as jest.Mock).mockResolvedValue([
        { example_id: "789" },
      ]);

      const result = await service.deleteExample({ example_id: 789 });

      expect(result).toEqual({ example_id: 789 });
    });

    it("throws NotFoundError when already deleted or not found", async () => {
      (mockDeleteExample.run as jest.Mock).mockResolvedValue([]);

      await expect(
        service.deleteExample({ example_id: 999 }),
      ).rejects.toBeInstanceOf(NotFoundError);
    });

    it("handles string example_id", async () => {
      (mockDeleteExample.run as jest.Mock).mockResolvedValue([
        { example_id: "999" },
      ]);

      const result = await service.deleteExample({ example_id: "999" });

      expect(result.example_id).toBe(999);
    });
  });
});
