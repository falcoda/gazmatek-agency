import { RequestHandler } from "express";
import {
  collectDefaultMetrics,
  Counter,
  Histogram,
  Registry,
} from "prom-client";

const registry = new Registry();

collectDefaultMetrics({
  prefix: "backend_",
  register: registry,
});

const httpRequestCounter = new Counter({
  name: "backend_http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status_code"] as const,
  registers: [registry],
});

const httpRequestDuration = new Histogram({
  name: "backend_http_request_duration_ms",
  help: "HTTP request duration in milliseconds",
  labelNames: ["method", "route", "status_code"] as const,
  buckets: [5, 10, 25, 50, 100, 250, 500, 1000, 2000, 5000],
  registers: [registry],
});

const getRouteLabel = (req: Parameters<RequestHandler>[0]) =>
  `${req.baseUrl}${req.route?.path ?? req.path ?? "unknown"}`;

export const requestMetricsMiddleware: RequestHandler = (req, res, next) => {
  const start = process.hrtime.bigint();

  res.on("finish", () => {
    const durationMs = Number(process.hrtime.bigint() - start) / 1_000_000;
    const labels = {
      method: req.method,
      route: getRouteLabel(req),
      status_code: String(res.statusCode),
    };

    httpRequestCounter.inc(labels);
    httpRequestDuration.observe(labels, durationMs);
  });

  next();
};

export const metricsHandler: RequestHandler = async (_req, res) => {
  res.setHeader("Content-Type", registry.contentType);
  res.end(await registry.metrics());
};
