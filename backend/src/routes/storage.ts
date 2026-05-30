import { HTTP_STATUS } from "@src/helpers/error/constants";
import { ValidationError } from "@src/helpers/error/errors";
import { getStorageService } from "@src/services/storage";
import { Router } from "express";
import mime from "mime-types";
import path from "path";

const storageRouter = Router();

/**
 * @swagger
 * /api/storage/{path}:
 *   get:
 *     summary: Public read-only access to uploaded files (artist covers, etc.).
 *     tags:
 *       - Storage
 *     parameters:
 *       - in: path
 *         name: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Relative storage path. Path traversal ("..") is rejected.
 *     responses:
 *       200:
 *         description: File contents streamed with the matching content type
 *       400:
 *         description: Invalid path (empty or contains "..")
 *       404:
 *         description: File not found
 */
// Public read-only access to uploads (artist cover images, etc.).
// Files are written under storage/<scope>/<relative-path> by upload routes.
storageRouter.get("/*splat", async (req, res, next) => {
  try {
    const rel = (req.params as { splat?: string[] | string }).splat;
    const relativePath = Array.isArray(rel) ? rel.join("/") : (rel ?? "");
    if (!relativePath || relativePath.includes("..")) {
      throw new ValidationError("Invalid path");
    }
    const buffer = await getStorageService().readBuffer(relativePath);
    if (!buffer) {
      res.status(HTTP_STATUS.NOT_FOUND).end();
      return;
    }
    const ext = path.extname(relativePath).toLowerCase();
    const contentType = mime.contentType(ext) || "application/octet-stream";
    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=86400");
    // Public read-only assets: override Helmet's default same-origin policy so
    // the frontend (different port in dev, different host in prod) can render
    // them via <img>/<video>. CORS for fetch() is handled separately by cors().
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    res.status(HTTP_STATUS.OK).end(buffer);
  } catch (error) {
    next(error);
  }
});

export default storageRouter;
