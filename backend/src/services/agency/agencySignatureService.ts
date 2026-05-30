import pool from "@src/db/dbConnect";
import { getAgencySettings } from "@src/db/query/agencySettings/getAgencySettings.types";
import { updateAgencySignature } from "@src/db/query/agencySettings/updateAgencySignature.types";
import logger from "@src/helpers/logger";
import { getStorageService } from "@src/services/storage";
import path from "path";

const AGENCY_SIGNATURE_DIR = "agency/signature";

export const AGENCY_SIGNATURE_MIME_TYPES: ReadonlySet<string> = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
]);

const extensionForMime = (mime: string): string => {
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  return "jpg";
};

export const saveAgencySignature = async (
  buffer: Buffer,
  mimetype: string,
): Promise<string> => {
  const ext = extensionForMime(mimetype);
  const relativePath = `${AGENCY_SIGNATURE_DIR}/signature-${Date.now()}.${ext}`;

  const storage = getStorageService();
  await storage.saveBuffer(relativePath, buffer);

  const [previous] = await getAgencySettings.run(undefined, pool);
  if (previous?.signature_image_path) {
    await storage
      .delete(previous.signature_image_path)
      .catch((error: unknown) => {
        logger.warn("Failed to delete previous agency signature", {
          path: previous.signature_image_path,
          error: error instanceof Error ? error.message : String(error),
        });
        return false;
      });
  }

  await updateAgencySignature.run({ signatureImagePath: relativePath }, pool);

  return relativePath;
};

export const removeAgencySignature = async (): Promise<void> => {
  const [current] = await getAgencySettings.run(undefined, pool);
  if (current?.signature_image_path) {
    await getStorageService()
      .delete(current.signature_image_path)
      .catch((error: unknown) => {
        logger.warn("Failed to delete agency signature on remove", {
          path: current.signature_image_path,
          error: error instanceof Error ? error.message : String(error),
        });
        return false;
      });
  }
  await updateAgencySignature.run({ signatureImagePath: null }, pool);
};

const mimeForExtension = (ext: string): string => {
  switch (ext) {
    case ".png":
      return "image/png";
    case ".webp":
      return "image/webp";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    default:
      return "application/octet-stream";
  }
};

/**
 * Loads the stored agency signature and returns it as an inline `data:` URL
 * usable directly inside an `<img src>` of a rendered HTML template.
 * Returns `null` when no signature is configured yet.
 */
export const getAgencySignatureDataUrl = async (): Promise<string | null> => {
  const [row] = await getAgencySettings.run(undefined, pool);
  if (!row?.signature_image_path) return null;

  const buffer = await getStorageService().readBuffer(row.signature_image_path);
  if (!buffer) {
    logger.warn("Agency signature path stored but file is missing", {
      path: row.signature_image_path,
    });
    return null;
  }

  const ext = path.extname(row.signature_image_path).toLowerCase();
  const mime = mimeForExtension(ext);
  return `data:${mime};base64,${buffer.toString("base64")}`;
};

export const getAgencySignaturePath = async (): Promise<string | null> => {
  const [row] = await getAgencySettings.run(undefined, pool);
  return row?.signature_image_path ?? null;
};
