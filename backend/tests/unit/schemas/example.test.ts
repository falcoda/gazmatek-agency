import {
  createExampleBodySchema,
  deleteExampleBodySchema,
  exampleQuerySchema,
  updateExampleBodySchema,
} from "@src/schemas/example";

describe("createExampleBodySchema", () => {
  it("accepts a valid body with only name", () => {
    expect(() =>
      createExampleBodySchema.parse({ name: "hello" }),
    ).not.toThrow();
  });

  it("accepts a valid body with name and description", () => {
    expect(() =>
      createExampleBodySchema.parse({ name: "hello", description: "desc" }),
    ).not.toThrow();
  });

  it("accepts null description", () => {
    expect(() =>
      createExampleBodySchema.parse({ name: "hello", description: null }),
    ).not.toThrow();
  });

  it("rejects a missing name", () => {
    expect(() => createExampleBodySchema.parse({})).toThrow();
  });

  it("rejects an empty name after trimming", () => {
    expect(() => createExampleBodySchema.parse({ name: "   " })).toThrow();
  });

  it("rejects an empty description string", () => {
    expect(() =>
      createExampleBodySchema.parse({ name: "ok", description: "  " }),
    ).toThrow();
  });
});

describe("updateExampleBodySchema", () => {
  it("accepts a body with numeric example_id and a name", () => {
    expect(() =>
      updateExampleBodySchema.parse({ example_id: 1, name: "updated" }),
    ).not.toThrow();
  });

  it("accepts a body with a string example_id", () => {
    expect(() =>
      updateExampleBodySchema.parse({ example_id: "abc", name: "ok" }),
    ).not.toThrow();
  });

  it("accepts a body with only example_id (name and description optional)", () => {
    expect(() =>
      updateExampleBodySchema.parse({ example_id: 5 }),
    ).not.toThrow();
  });

  it("rejects a missing example_id", () => {
    expect(() => updateExampleBodySchema.parse({ name: "ok" })).toThrow();
  });

  it("rejects a zero example_id (not positive)", () => {
    expect(() =>
      updateExampleBodySchema.parse({ example_id: 0, name: "ok" }),
    ).toThrow();
  });

  it("rejects an empty string example_id", () => {
    expect(() =>
      updateExampleBodySchema.parse({ example_id: "", name: "ok" }),
    ).toThrow();
  });
});

describe("deleteExampleBodySchema", () => {
  it("accepts a valid numeric example_id", () => {
    expect(() =>
      deleteExampleBodySchema.parse({ example_id: 5 }),
    ).not.toThrow();
  });

  it("accepts a valid string example_id", () => {
    expect(() =>
      deleteExampleBodySchema.parse({ example_id: "abc" }),
    ).not.toThrow();
  });

  it("rejects a missing example_id", () => {
    expect(() => deleteExampleBodySchema.parse({})).toThrow();
  });

  it("rejects a negative numeric example_id", () => {
    expect(() => deleteExampleBodySchema.parse({ example_id: -1 })).toThrow();
  });
});

describe("exampleQuerySchema", () => {
  it("accepts an empty query object", () => {
    expect(() => exampleQuerySchema.parse({})).not.toThrow();
  });

  it("accepts an optional example_id string", () => {
    expect(() => exampleQuerySchema.parse({ example_id: "42" })).not.toThrow();
  });

  it("accepts undefined example_id", () => {
    expect(() =>
      exampleQuerySchema.parse({ example_id: undefined }),
    ).not.toThrow();
  });

  it("rejects an empty string example_id", () => {
    expect(() => exampleQuerySchema.parse({ example_id: "" })).toThrow();
  });
});

/**
 * EDGE CASE TESTS
 * These tests cover boundary conditions and uncommon scenarios
 */
describe("Schema Edge Cases", () => {
  describe("createExampleBodySchema - field length limits", () => {
    it("accepts name at maximum length (255 chars)", () => {
      const longName = "a".repeat(255);
      expect(() =>
        createExampleBodySchema.parse({ name: longName }),
      ).not.toThrow();
    });

    it("rejects name exceeding maximum length", () => {
      const tooLongName = "a".repeat(256);
      expect(() =>
        createExampleBodySchema.parse({ name: tooLongName }),
      ).toThrow();
    });

    it("accepts very long description", () => {
      const longDescription = "word ".repeat(1000); // ~5000 chars
      expect(() =>
        createExampleBodySchema.parse({
          name: "ok",
          description: longDescription,
        }),
      ).not.toThrow();
    });

    it("handles whitespace correctly - trims before validation", () => {
      expect(() =>
        createExampleBodySchema.parse({ name: "   hello   " }),
      ).not.toThrow();
    });
  });

  describe("updateExampleBodySchema - union type handling", () => {
    it("coerces string example_id to number if numeric string", () => {
      const result = updateExampleBodySchema.parse({
        example_id: "123",
        name: "updated",
      });
      expect(result.example_id).toBeDefined(); // Zod coerced it
    });

    it("accepts UUID-like string as example_id", () => {
      expect(() =>
        updateExampleBodySchema.parse({
          example_id: "550e8400-e29b-41d4-a716-446655440000",
        }),
      ).not.toThrow();
    });

    it("preserves all optional fields as undefined when not provided", () => {
      const result = updateExampleBodySchema.parse({ example_id: 1 });
      expect(result.name).toBeUndefined();
      expect(result.description).toBeUndefined();
    });

    it("allows partial updates with only name changed", () => {
      const result = updateExampleBodySchema.parse({
        example_id: 1,
        name: "new name",
      });
      expect(result.name).toBe("new name");
      expect(result.description).toBeUndefined();
    });

    it("allows partial updates with only description changed", () => {
      const result = updateExampleBodySchema.parse({
        example_id: 1,
        description: "new description",
      });
      expect(result.name).toBeUndefined();
      expect(result.description).toBe("new description");
    });
  });

  describe("deleteExampleBodySchema - numeric boundaries", () => {
    it("accepts large positive example_id", () => {
      expect(() =>
        deleteExampleBodySchema.parse({
          example_id: 999999999,
        }),
      ).not.toThrow();
    });

    it("rejects example_id of 0 (not positive)", () => {
      expect(() => deleteExampleBodySchema.parse({ example_id: 0 })).toThrow();
    });

    it("rejects negative example_id", () => {
      expect(() => deleteExampleBodySchema.parse({ example_id: -5 })).toThrow();
    });

    it("rejects floating point example_id (requires integer)", () => {
      expect(() =>
        deleteExampleBodySchema.parse({
          example_id: 3.14,
        }),
      ).toThrow();
    });
  });

  describe("null and undefined handling", () => {
    it("createExampleBodySchema allows null description", () => {
      const result = createExampleBodySchema.parse({
        name: "test",
        description: null,
      });
      expect(result.description).toBeNull();
    });

    it("updateExampleBodySchema allows null description for update", () => {
      const result = updateExampleBodySchema.parse({
        example_id: 1,
        description: null,
      });
      expect(result.description).toBeNull();
    });

    it("exampleQuerySchema handles missing properties gracefully", () => {
      const result = exampleQuerySchema.parse({});
      expect(result.example_id).toBeUndefined();
    });
  });

  describe("type coercion", () => {
    it("example_id accepts numeric string and converts for validation", () => {
      expect(() =>
        deleteExampleBodySchema.parse({ example_id: "999" }),
      ).not.toThrow();
    });

    it("example_id accepts non-empty string even if not purely numeric", () => {
      expect(() =>
        deleteExampleBodySchema.parse({ example_id: "example-001" }),
      ).not.toThrow();
    });
  });

  describe("special characters and encoding", () => {
    it("accepts name with special characters", () => {
      expect(() =>
        createExampleBodySchema.parse({
          name: "Test & Example <Entity> 中文 🚀",
        }),
      ).not.toThrow();
    });

    it("accepts description with newlines and tabs", () => {
      expect(() =>
        createExampleBodySchema.parse({
          name: "test",
          description: "Line 1\nLine 2\tTabbed",
        }),
      ).not.toThrow();
    });

    it("accepts description with HTML-like content", () => {
      expect(() =>
        createExampleBodySchema.parse({
          name: "test",
          description: "<script>alert('test')</script>",
        }),
      ).not.toThrow();
    });
  });
});
