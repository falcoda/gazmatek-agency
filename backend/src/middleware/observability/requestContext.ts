import { config } from "@src/helpers/config";
import { randomUUID } from "crypto";
import { RequestHandler } from "express";

export const requestContextMiddleware: RequestHandler = (req, res, next) => {
  const requestId =
    req.header(config.observability.requestIdHeader) ?? randomUUID();

  req.requestId = requestId;
  res.setHeader(config.observability.requestIdHeader, requestId);

  next();
};
