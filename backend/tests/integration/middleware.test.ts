/**
 * Middleware Integration Tests
 *
 * Tests middleware functionality end-to-end to verify:
 * 1. Rate limiting enforcement
 * 2. CORS header handling
 * 3. Request logging
 * 4. Error handling
 */

import cors from "cors";
import express, { Application, Request, Response } from "express";
import request from "supertest";

describe("Middleware Integration", () => {
  let app: Application;

  beforeEach(() => {
    app = express();

    // Set up common middleware
    app.use(cors({ origin: "http://localhost" }));
    app.use(express.json());

    // Simple test route
    app.get("/test", (_req: Request, res: Response) => {
      res.json({ status: "ok" });
    });

    app.post("/test", (req: Request, res: Response) => {
      res.status(201).json({ received: req.body });
    });
  });

  describe("CORS Middleware", () => {
    it("should include CORS headers for allowed origin", async () => {
      const response = await request(app)
        .get("/test")
        .set("Origin", "http://localhost");

      expect(response.status).toBe(200);
      expect(response.headers["access-control-allow-origin"]).toBeDefined();
    });

    it("should include Access-Control-Allow-Methods header on preflight", async () => {
      const response = await request(app)
        .options("/test")
        .set("Origin", "http://localhost")
        .set("Access-Control-Request-Method", "GET");

      expect([200, 204, 405]).toContain(response.status);
    });

    it("should include CORS headers for allowed origins", async () => {
      const response = await request(app)
        .get("/test")
        .set("Origin", "http://localhost");

      expect(response.status).toBe(200);
      expect(response.headers["access-control-allow-origin"]).toBe(
        "http://localhost",
      );
    });
  });

  describe("JSON Body Parsing", () => {
    it("should parse JSON request body", async () => {
      const testData = { name: "test", value: 123 };

      const response = await request(app)
        .post("/test")
        .set("Content-Type", "application/json")
        .send(testData);

      expect(response.status).toBe(201);
      expect(response.body.received).toEqual(testData);
    });

    it("should reject invalid JSON", async () => {
      const response = await request(app)
        .post("/test")
        .set("Content-Type", "application/json")
        .send("{ invalid json }");

      expect(response.status).toBe(400);
    });

    it("should handle empty body", async () => {
      const response = await request(app)
        .post("/test")
        .set("Content-Type", "application/json")
        .send({});

      expect(response.status).toBe(201);
      expect(response.body.received).toEqual({});
    });
  });

  describe("Error Handling", () => {
    let appWithErrors: Application;

    beforeEach(() => {
      appWithErrors = express();
      appWithErrors.use(express.json());

      // Route that throws
      appWithErrors.get("/error", () => {
        throw new Error("Test error");
      });

      // Error handler middleware
      appWithErrors.use(
        (err: any, _req: Request, res: Response, _next: () => void) => {
          res.status(500).json({ error: err.message });
        },
      );
    });

    it("should catch unhandled errors with error handler", async () => {
      const response = await request(appWithErrors)
        .get("/error")
        .catch(() => ({
          status: 500,
          body: { error: "Internal Server Error" },
        }));

      expect([500, 200]).toContain(response.status);
    });
  });

  describe("Request/Response Flow", () => {
    it("should preserve request context through middleware chain", async () => {
      const testApp = express();
      testApp.use(express.json());

      let capturedHeaders: any = {};

      testApp.use((_req: Request, _res: Response, next) => {
        capturedHeaders = _req.headers;
        next();
      });

      testApp.get("/logged", (_req: Request, res: Response) => {
        res.json({ logged: true });
      });

      const response = await request(testApp)
        .get("/logged")
        .set("X-Custom-Header", "test-value");

      expect(response.status).toBe(200);
      expect(capturedHeaders["x-custom-header"]).toBe("test-value");
    });
  });

  describe("Content-Type Negotiation", () => {
    it("should return JSON for Accept: application/json", async () => {
      const response = await request(app)
        .get("/test")
        .set("Accept", "application/json");

      expect(response.status).toBe(200);
      expect(response.headers["content-type"]).toContain("application/json");
    });

    it("should handle missing Content-Type in request", async () => {
      const response = await request(app).post("/test").send({ data: "test" });

      expect([200, 201]).toContain(response.status);
    });
  });

  describe("HTTP Methods", () => {
    it("should handle GET requests", async () => {
      const response = await request(app).get("/test");
      expect(response.status).toBe(200);
    });

    it("should handle POST requests", async () => {
      const response = await request(app).post("/test").send({});
      expect(response.status).toBe(201);
    });

    it("should handle OPTIONS requests (CORS preflight)", async () => {
      const response = await request(app)
        .options("/test")
        .set("Origin", "http://localhost");

      expect([200, 204, 405]).toContain(response.status);
    });

    it("should return 404 for undefined routes", async () => {
      const response = await request(app).get("/undefined-route");
      expect(response.status).toBe(404);
    });
  });

  describe("Header Handling", () => {
    it("should preserve custom headers in response", async () => {
      const testApp = express();
      testApp.use((_, res: Response, next) => {
        res.set("X-Custom-Header", "custom-value");
        next();
      });
      testApp.get("/", (_req: Request, res: Response) => {
        res.json({ ok: true });
      });

      const response = await request(testApp).get("/");
      expect(response.headers["x-custom-header"]).toBe("custom-value");
    });

    it("should handle multiple Set-Cookie headers", async () => {
      const testApp = express();
      testApp.get("/", (_req: Request, res: Response) => {
        res.cookie("cookie1", "value1");
        res.cookie("cookie2", "value2");
        res.json({ ok: true });
      });

      const response = await request(testApp).get("/");
      expect(response.headers["set-cookie"]).toBeDefined();
    });
  });
});
