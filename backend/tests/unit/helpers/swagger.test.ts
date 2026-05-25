/**
 * Swagger Helper Tests
 *
 * Verifies that Swagger/OpenAPI documentation is correctly generated
 * and that the JSON schema is valid.
 */

import swaggerJsdoc from "swagger-jsdoc";

describe("Swagger Helper", () => {
  const mockOptions = {
    definition: {
      openapi: "3.0.0",
      info: {
        title: "Test API",
        version: "1.0.0",
      },
      servers: [
        {
          url: "http://localhost:4001",
        },
      ],
    },
    apis: [],
  };

  it("should generate OpenAPI specification", () => {
    const spec = swaggerJsdoc(mockOptions);
    expect(spec).toBeDefined();
  });

  it("should have valid OpenAPI 3.0.0 structure", () => {
    const spec = swaggerJsdoc(mockOptions) as any;
    expect(spec.openapi).toBe("3.0.0");
    expect(spec.info).toBeDefined();
    expect(spec.info.title).toBe("Test API");
    expect(spec.info.version).toBe("1.0.0");
  });

  it("should include servers configuration", () => {
    const spec = swaggerJsdoc(mockOptions) as any;
    expect(spec.servers).toBeDefined();
    expect(Array.isArray(spec.servers)).toBe(true);
    expect(spec.servers.length).toBeGreaterThan(0);
  });

  it("should include paths and components sections", () => {
    const spec = swaggerJsdoc(mockOptions) as any;
    expect(spec.paths).toBeDefined();
    expect(spec.components).toBeDefined();
  });

  it("should generate valid JSON from spec", () => {
    const spec = swaggerJsdoc(mockOptions);
    expect(() => {
      JSON.stringify(spec);
    }).not.toThrow();
  });

  it("should support security definitions", () => {
    const optionsWithSecurity = {
      ...mockOptions,
      definition: {
        ...mockOptions.definition,
        components: {
          securitySchemes: {
            bearerAuth: {
              type: "http",
              scheme: "bearer",
              bearerFormat: "JWT",
            },
            apiKeyAuth: {
              type: "apiKey",
              in: "header",
              name: "x-api-key",
            },
          },
        },
      },
    };

    const spec = swaggerJsdoc(optionsWithSecurity) as any;
    expect(spec.components.securitySchemes).toBeDefined();
    expect(spec.components.securitySchemes.bearerAuth).toBeDefined();
    expect(spec.components.securitySchemes.apiKeyAuth).toBeDefined();
  });
});
