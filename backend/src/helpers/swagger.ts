import { config } from "@src/helpers/config";
import { openApiSchemas } from "@src/helpers/openApiSchemas";
import { docsRateLimiter } from "@src/middleware/security/rateLimit";
import { Express, RequestHandler } from "express";
import fs from "fs";
import path from "path";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const getSwaggerApiFiles = (): string[] => {
  const candidateDirectories = [
    path.resolve(process.cwd(), "src", "routes"),
    path.resolve(process.cwd(), "dist", "routes"),
  ];

  return (
    candidateDirectories
      .filter((directory) => fs.existsSync(directory))
      .flatMap((directory) => [
        path.join(directory, "*.ts"),
        path.join(directory, "*.js"),
      ])
      // swagger-jsdoc resolves `apis` through `glob`, which treats backslashes
      // as escape characters. On Windows `path.join` yields backslash paths,
      // so the patterns must be normalised to forward slashes to match files.
      .map((pattern) => pattern.split(path.sep).join("/"))
  );
};

const buildSwaggerSpec = () =>
  swaggerJSDoc({
    definition: {
      openapi: "3.0.0",
      info: {
        title: config.docs.title,
        version: config.app.version,
        description: "Swagger documentation for the backend template",
      },
      servers: [
        {
          url: config.app.baseUrl,
        },
      ],
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
            name: config.auth.apiKeyHeader,
          },
        },
        schemas: openApiSchemas,
      },
    },
    apis: getSwaggerApiFiles(),
  });

export const setupSwagger = (app: Express) => {
  if (!config.docs.enabled) {
    return;
  }

  const swaggerSpec = buildSwaggerSpec();
  const serveSwagger = swaggerUi.serve as RequestHandler[];

  app.get(config.docs.jsonPath, docsRateLimiter, (_req, res) => {
    res.json(swaggerSpec);
  });

  app.use(
    config.docs.path,
    docsRateLimiter,
    ...serveSwagger,
    swaggerUi.setup(swaggerSpec, {
      explorer: true,
    }),
  );
};
