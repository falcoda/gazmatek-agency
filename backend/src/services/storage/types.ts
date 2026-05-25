export interface StorageService {
  saveText(relativePath: string, content: string): Promise<string | null>;
  saveJson(relativePath: string, value: unknown): Promise<string | null>;
  saveBuffer(relativePath: string, buffer: Buffer): Promise<string | null>;
  readText(relativePath: string): Promise<string | null>;
  readBuffer(relativePath: string): Promise<Buffer | null>;
  readJson<T>(relativePath: string): Promise<T | null>;
  delete(relativePath: string): Promise<boolean>;
  close(): Promise<void>;
}
