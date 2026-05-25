import {
  CreateBucketCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadBucketCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { config } from "@src/helpers/config";
import { logger } from "@src/helpers/logger";
import { StorageService } from "@src/services/storage/types";

export class S3StorageService implements StorageService {
  private client: S3Client;
  private bucket = config.storage.s3.bucket;
  private ready: Promise<void>;

  constructor() {
    this.client = new S3Client({
      endpoint: config.storage.s3.endpoint,
      region: config.storage.s3.region,
      forcePathStyle: config.storage.s3.forcePathStyle,
      credentials: {
        accessKeyId: config.storage.s3.accessKey,
        secretAccessKey: config.storage.s3.secretKey,
      },
    });

    this.ready = this.ensureBucket();
  }

  private async ensureBucket(): Promise<void> {
    try {
      await this.client.send(new HeadBucketCommand({ Bucket: this.bucket }));
    } catch {
      await this.client.send(new CreateBucketCommand({ Bucket: this.bucket }));
      logger.info(`S3 bucket "${this.bucket}" created`);
    }
  }

  async saveText(relativePath: string, content: string): Promise<string> {
    await this.ready;
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: relativePath,
        Body: content,
        ContentType: "text/plain",
      }),
    );

    return relativePath;
  }

  async saveJson(relativePath: string, value: unknown): Promise<string> {
    await this.ready;
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: relativePath,
        Body: JSON.stringify(value, null, 2),
        ContentType: "application/json",
      }),
    );

    return relativePath;
  }

  async saveBuffer(relativePath: string, buffer: Buffer): Promise<string> {
    await this.ready;
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: relativePath,
        Body: buffer,
      }),
    );

    return relativePath;
  }

  async readText(relativePath: string): Promise<string | null> {
    const buffer = await this.readBuffer(relativePath);

    if (!buffer) {
      return null;
    }

    return buffer.toString("utf8");
  }

  async readBuffer(relativePath: string): Promise<Buffer | null> {
    await this.ready;
    try {
      const response = await this.client.send(
        new GetObjectCommand({
          Bucket: this.bucket,
          Key: relativePath,
        }),
      );

      if (!response.Body) {
        return null;
      }

      const bytes = await response.Body.transformToByteArray();
      return Buffer.from(bytes);
    } catch (error) {
      const err = error as {
        name?: string;
        $metadata?: { httpStatusCode?: number };
      };

      if (err.name === "NoSuchKey" || err.$metadata?.httpStatusCode === 404) {
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
    await this.ready;
    try {
      await this.client.send(
        new DeleteObjectCommand({
          Bucket: this.bucket,
          Key: relativePath,
        }),
      );

      return true;
    } catch (error) {
      const err = error as {
        name?: string;
        $metadata?: { httpStatusCode?: number };
      };

      if (err.name === "NoSuchKey" || err.$metadata?.httpStatusCode === 404) {
        return false;
      }

      throw error;
    }
  }

  async close(): Promise<void> {
    this.client.destroy();
  }
}
