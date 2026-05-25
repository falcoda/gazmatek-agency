import { config } from "@src/helpers/config";
import { STORAGE_ERROR_CODES } from "@src/helpers/constants";
import { StorageService } from "@src/services/storage/types";
import fs from "fs/promises";
import path from "path";

export class LocalStorageService implements StorageService {
  private root = path.resolve(process.cwd(), config.storage.localRoot);

  private async ensureParent(relativePath: string) {
    await fs.mkdir(path.dirname(path.join(this.root, relativePath)), {
      recursive: true,
    });
  }

  async saveText(relativePath: string, content: string): Promise<string> {
    await this.ensureParent(relativePath);
    const absolutePath = path.join(this.root, relativePath);
    await fs.writeFile(absolutePath, content, "utf8");
    return absolutePath;
  }

  async saveBuffer(relativePath: string, buffer: Buffer): Promise<string> {
    await this.ensureParent(relativePath);
    const absolutePath = path.join(this.root, relativePath);
    await fs.writeFile(absolutePath, buffer);
    return absolutePath;
  }

  async saveJson(relativePath: string, value: unknown): Promise<string> {
    return this.saveText(relativePath, JSON.stringify(value, null, 2));
  }

  async readText(relativePath: string): Promise<string | null> {
    const absolutePath = path.join(this.root, relativePath);

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
    const absolutePath = path.join(this.root, relativePath);

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
    const absolutePath = path.join(this.root, relativePath);

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
