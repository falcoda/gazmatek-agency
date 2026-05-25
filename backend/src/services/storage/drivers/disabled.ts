import { StorageService } from "@src/services/storage/types";

export class DisabledStorageService implements StorageService {
  async saveText(_relativePath: string, _content: string): Promise<null> {
    return null;
  }

  async saveJson(_relativePath: string, _value: unknown): Promise<null> {
    return null;
  }

  async saveBuffer(_relativePath: string, _buffer: Buffer): Promise<null> {
    return null;
  }

  async readText(_relativePath: string): Promise<null> {
    return null;
  }

  async readBuffer(_relativePath: string): Promise<null> {
    return null;
  }

  async readJson<T>(_relativePath: string): Promise<T | null> {
    return null;
  }

  async delete(_relativePath: string): Promise<boolean> {
    return false;
  }

  async close(): Promise<void> {
    return;
  }
}
