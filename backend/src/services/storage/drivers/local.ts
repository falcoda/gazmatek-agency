import { config } from "@src/helpers/config";
import { STORAGE_ERROR_CODES } from "@src/helpers/constants";
import { ValidationError } from "@src/helpers/error/errors";
import { StorageService } from "@src/services/storage/types";
import fs from "fs/promises";
import path from "path";

export class LocalStorageService implements StorageService {
  private root = path.resolve(process.cwd(), config.storage.localRoot);

  /**
   * Resolves a relative key against the storage root and guarantees the result
   * stays inside it. Defense in depth against path traversal (absolute paths,
   * "..", Windows drive letters) regardless of what the caller passes — the
   * route-level guard is only a first line. Every fs access goes through here.
   */
  private resolveWithin(relativePath: string): string {
    const absolutePath = path.resolve(this.root, relativePath);
    const rootWithSep = this.root.endsWith(path.sep)
      ? this.root
      : this.root + path.sep;
    if (absolutePath !== this.root && !absolutePath.startsWith(rootWithSep)) {
      throw new ValidationError("Invalid storage path");
    }
    return absolutePath;
  }

  private async ensureParent(relativePath: string) {
    await fs.mkdir(path.dirname(this.resolveWithin(relativePath)), {
      recursive: true,
    });
  }

  async saveText(relativePath: string, content: string): Promise<string> {
    await this.ensureParent(relativePath);
    const absolutePath = this.resolveWithin(relativePath);
    await fs.writeFile(absolutePath, content, "utf8");
    return absolutePath;
  }

  async saveBuffer(relativePath: string, buffer: Buffer): Promise<string> {
    await this.ensureParent(relativePath);
    const absolutePath = this.resolveWithin(relativePath);
    await fs.writeFile(absolutePath, buffer);
    return absolutePath;
  }

  async saveJson(relativePath: string, value: unknown): Promise<string> {
    return this.saveText(relativePath, JSON.stringify(value, null, 2));
  }

  async readText(relativePath: string): Promise<string | null> {
    const absolutePath = this.resolveWithin(relativePath);

    try {
      return await fs.readFile(absolutePath, "utf8");
    } catch (error) {
      const err = error as NodeJS.ErrnoException;

      if (err.code === STORAGE_ERROR_CODES.NOT_FOUND) {
        return null;
      }

      throw error;
    }
  }

  async readBuffer(relativePath: string): Promise<Buffer | null> {
    const absolutePath = this.resolveWithin(relativePath);

    try {
      return await fs.readFile(absolutePath);
    } catch (error) {
      const err = error as NodeJS.ErrnoException;

      if (err.code === STORAGE_ERROR_CODES.NOT_FOUND) {
        return null;
      }

      throw error;
    }
  }

  async readJson<T>(relativePath: string): Promise<T | null> {
    const content = await this.readText(relativePath);

    if (!content) {
      return null;
    }

    try {
      return JSON.parse(content) as T;
    } catch {
      return null;
    }
  }

  async delete(relativePath: string): Promise<boolean> {
    const absolutePath = this.resolveWithin(relativePath);

    try {
      await fs.rm(absolutePath, { force: true });
      return true;
    } catch (error) {
      const err = error as NodeJS.ErrnoException;

      if (err.code === STORAGE_ERROR_CODES.NOT_FOUND) {
        return false;
      }

      throw error;
    }
  }

  async close(): Promise<void> {
    return;
  }
}
