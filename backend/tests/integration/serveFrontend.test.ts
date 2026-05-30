import { serveFrontend } from "@src/helpers/serveFrontend";
import express, { Express } from "express";
import fs from "fs";
import os from "os";
import path from "path";
import request from "supertest";

// Marker strings so assertions don't depend on the real frontend build output.
const INDEX_MARKER = "<!doctype html><title>spa-fixture</title>";
const ASSET_MARKER = "console.log('asset');";

describe("frontend SPA serving", () => {
  let app: Express;
  let fixtureDir: string;

  beforeAll(() => {
    fixtureDir = fs.mkdtempSync(path.join(os.tmpdir(), "spa-fixture-"));
    fs.writeFileSync(path.join(fixtureDir, "index.html"), INDEX_MARKER);
    fs.mkdirSync(path.join(fixtureDir, "assets"));
    fs.writeFileSync(path.join(fixtureDir, "assets", "app.js"), ASSET_MARKER);

    app = express();
    serveFrontend(app, fixtureDir);
    // Mimic createApp: backend paths fall through serveFrontend to a JSON 404.
    app.use((_req, res) => {
      res.status(404).json({ message: "Route not found" });
    });
  });

  afterAll(() => {
    fs.rmSync(fixtureDir, { recursive: true, force: true });
  });

  it("serves index.html at the root", async () => {
    const response = await request(app).get("/");

    expect(response.status).toBe(200);
    expect(response.headers["content-type"]).toContain("text/html");
    expect(response.text).toContain("spa-fixture");
  });

  it("falls back to index.html for unknown client routes", async () => {
    const response = await request(app).get("/dashboard/anything");

    expect(response.status).toBe(200);
    expect(response.text).toContain("spa-fixture");
  });

  it("serves static assets directly", async () => {
    const response = await request(app).get("/assets/app.js");

    expect(response.status).toBe(200);
    expect(response.text).toContain("asset");
  });

  it("does not hijack API routes (they fall through to a JSON 404)", async () => {
    const response = await request(app).get("/api/unknown-route");

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Route not found");
  });
});
