// Mocks must be declared before any imports (Jest hoisting).
jest.mock("fs/promises", () => ({
  mkdir: jest.fn().mockResolvedValue(undefined),
  writeFile: jest.fn().mockResolvedValue(undefined),
  readFile: jest.fn(),
  rm: jest.fn().mockResolvedValue(undefined),
}));

const mockS3Send = jest.fn();
const mockS3Destroy = jest.fn();

jest.mock("@aws-sdk/client-s3", () => ({
  S3Client: jest.fn().mockImplementation(() => ({
    send: mockS3Send,
    destroy: mockS3Destroy,
  })),
  HeadBucketCommand: jest.fn((input: unknown) => ({
    __type: "HeadBucket",
    input,
  })),
  CreateBucketCommand: jest.fn((input: unknown) => ({
    __type: "CreateBucket",
    input,
  })),
  PutObjectCommand: jest.fn((input: unknown) => ({
    __type: "PutObject",
    input,
  })),
  GetObjectCommand: jest.fn((input: unknown) => ({
    __type: "GetObject",
    input,
  })),
  DeleteObjectCommand: jest.fn((input: unknown) => ({
    __type: "DeleteObject",
    input,
  })),
}));

jest.mock("@src/helpers/logger", () => ({
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

import {
  CreateBucketCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { logger } from "@src/helpers/logger";
import { DisabledStorageService } from "@src/services/storage/drivers/disabled";
import { LocalStorageService } from "@src/services/storage/drivers/local";
import { S3StorageService } from "@src/services/storage/drivers/s3";
import fs from "fs/promises";

const mFsMkdir = fs.mkdir as jest.Mock;
const mFsWriteFile = fs.writeFile as jest.Mock;
const mFsReadFile = fs.readFile as jest.Mock;
const mFsRm = fs.rm as jest.Mock;
const mLoggerInfo = logger.info as jest.Mock;

const enoent = (): NodeJS.ErrnoException =>
  Object.assign(new Error("not found"), { code: "ENOENT" });

// ── LocalStorageService ────────────────────────────────────────────────────
describe("LocalStorageService", () => {
  let service: LocalStorageService;

  beforeEach(() => {
    service = new LocalStorageService();
    mFsMkdir.mockResolvedValue(undefined);
    mFsWriteFile.mockResolvedValue(undefined);
    mFsRm.mockResolvedValue(undefined);
  });

  it("saveText creates the parent folder and writes a UTF-8 file", async () => {
    const result = await service.saveText("docs/a.txt", "hello");

    expect(mFsMkdir).toHaveBeenCalledWith(expect.any(String), {
      recursive: true,
    });
    expect(mFsWriteFile).toHaveBeenCalledWith(
      expect.stringContaining("a.txt"),
      "hello",
      "utf8",
    );
    expect(result).toContain("a.txt");
  });

  it("saveBuffer writes the raw buffer", async () => {
    const buffer = Buffer.from("binary");
    const result = await service.saveBuffer("docs/b.bin", buffer);

    expect(mFsWriteFile).toHaveBeenCalledWith(
      expect.stringContaining("b.bin"),
      buffer,
    );
    expect(result).toContain("b.bin");
  });

  it("saveJson serialises the value as pretty JSON", async () => {
    await service.saveJson("docs/c.json", { ok: true });

    expect(mFsWriteFile).toHaveBeenCalledWith(
      expect.stringContaining("c.json"),
      JSON.stringify({ ok: true }, null, 2),
      "utf8",
    );
  });

  it("readText returns the file content", async () => {
    mFsReadFile.mockResolvedValue("file-content");
    await expect(service.readText("docs/a.txt")).resolves.toBe("file-content");
  });

  it("readText returns null when the file is missing", async () => {
    mFsReadFile.mockRejectedValue(enoent());
    await expect(service.readText("missing.txt")).resolves.toBeNull();
  });

  it("readText rethrows unexpected filesystem errors", async () => {
    const failure = Object.assign(new Error("denied"), { code: "EACCES" });
    mFsReadFile.mockRejectedValue(failure);
    await expect(service.readText("a.txt")).rejects.toBe(failure);
  });

  it("readBuffer returns the file buffer", async () => {
    const buffer = Buffer.from("bytes");
    mFsReadFile.mockResolvedValue(buffer);
    await expect(service.readBuffer("a.bin")).resolves.toBe(buffer);
  });

  it("readBuffer returns null when the file is missing", async () => {
    mFsReadFile.mockRejectedValue(enoent());
    await expect(service.readBuffer("missing.bin")).resolves.toBeNull();
  });

  it("readBuffer rethrows unexpected filesystem errors", async () => {
    const failure = Object.assign(new Error("io"), { code: "EIO" });
    mFsReadFile.mockRejectedValue(failure);
    await expect(service.readBuffer("a.bin")).rejects.toBe(failure);
  });

  it("readJson parses stored JSON", async () => {
    mFsReadFile.mockResolvedValue('{"value":42}');
    await expect(service.readJson("a.json")).resolves.toEqual({ value: 42 });
  });

  it("readJson returns null when the file is missing", async () => {
    mFsReadFile.mockRejectedValue(enoent());
    await expect(service.readJson("missing.json")).resolves.toBeNull();
  });

  it("readJson returns null for malformed JSON", async () => {
    mFsReadFile.mockResolvedValue("{not-json");
    await expect(service.readJson("a.json")).resolves.toBeNull();
  });

  it("delete returns true when the file is removed", async () => {
    await expect(service.delete("a.txt")).resolves.toBe(true);
    expect(mFsRm).toHaveBeenCalledWith(expect.stringContaining("a.txt"), {
      force: true,
    });
  });

  it("delete returns false when the file is missing", async () => {
    mFsRm.mockRejectedValue(enoent());
    await expect(service.delete("missing.txt")).resolves.toBe(false);
  });

  it("delete rethrows unexpected filesystem errors", async () => {
    const failure = Object.assign(new Error("busy"), { code: "EBUSY" });
    mFsRm.mockRejectedValue(failure);
    await expect(service.delete("a.txt")).rejects.toBe(failure);
  });

  it("close resolves without doing anything", async () => {
    await expect(service.close()).resolves.toBeUndefined();
  });
});

// ── S3StorageService ───────────────────────────────────────────────────────
describe("S3StorageService", () => {
  const s3Body = (text: string) => ({
    Body: {
      transformToByteArray: jest
        .fn()
        .mockResolvedValue(new Uint8Array(Buffer.from(text))),
    },
  });

  beforeEach(() => {
    mockS3Send.mockReset();
    mockS3Send.mockResolvedValue({});
  });

  const buildService = () => new S3StorageService();

  it("checks the bucket exists on construction", async () => {
    const service = buildService();
    await service.saveText("x.txt", "content");

    expect(mockS3Send).toHaveBeenCalledWith(
      expect.objectContaining({ __type: "HeadBucket" }),
    );
  });

  it("creates the bucket when the head check fails", async () => {
    mockS3Send.mockImplementation((cmd: { __type: string }) => {
      if (cmd.__type === "HeadBucket") {
        return Promise.reject(new Error("missing"));
      }
      return Promise.resolve({});
    });

    const service = buildService();
    await service.saveText("x.txt", "content");

    expect(CreateBucketCommand).toHaveBeenCalled();
    expect(mLoggerInfo).toHaveBeenCalledWith(
      expect.stringContaining("created"),
    );
  });

  it("saveText uploads a text/plain object", async () => {
    const service = buildService();
    const result = await service.saveText("dir/a.txt", "hello");

    expect(PutObjectCommand).toHaveBeenCalledWith(
      expect.objectContaining({
        Key: "dir/a.txt",
        Body: "hello",
        ContentType: "text/plain",
      }),
    );
    expect(result).toBe("dir/a.txt");
  });

  it("saveJson uploads an application/json object", async () => {
    const service = buildService();
    const result = await service.saveJson("dir/a.json", { ok: true });

    expect(PutObjectCommand).toHaveBeenCalledWith(
      expect.objectContaining({
        Key: "dir/a.json",
        Body: JSON.stringify({ ok: true }, null, 2),
        ContentType: "application/json",
      }),
    );
    expect(result).toBe("dir/a.json");
  });

  it("saveBuffer uploads a raw buffer", async () => {
    const service = buildService();
    const buffer = Buffer.from("bytes");
    const result = await service.saveBuffer("dir/a.bin", buffer);

    expect(PutObjectCommand).toHaveBeenCalledWith(
      expect.objectContaining({ Key: "dir/a.bin", Body: buffer }),
    );
    expect(result).toBe("dir/a.bin");
  });

  it("readBuffer downloads and returns the object bytes", async () => {
    mockS3Send.mockImplementation((cmd: { __type: string }) => {
      if (cmd.__type === "GetObject") {
        return Promise.resolve(s3Body("downloaded"));
      }
      return Promise.resolve({});
    });

    const service = buildService();
    const result = await service.readBuffer("dir/a.bin");

    expect(GetObjectCommand).toHaveBeenCalledWith(
      expect.objectContaining({ Key: "dir/a.bin" }),
    );
    expect(result?.toString("utf8")).toBe("downloaded");
  });

  it("readBuffer returns null when the response has no body", async () => {
    mockS3Send.mockImplementation((cmd: { __type: string }) => {
      if (cmd.__type === "GetObject") {
        return Promise.resolve({ Body: undefined });
      }
      return Promise.resolve({});
    });

    const service = buildService();
    await expect(service.readBuffer("dir/a.bin")).resolves.toBeNull();
  });

  it("readBuffer returns null for a NoSuchKey error", async () => {
    mockS3Send.mockImplementation((cmd: { __type: string }) => {
      if (cmd.__type === "GetObject") {
        return Promise.reject(
          Object.assign(new Error("nope"), {
            name: "NoSuchKey",
          }),
        );
      }
      return Promise.resolve({});
    });

    const service = buildService();
    await expect(service.readBuffer("missing.bin")).resolves.toBeNull();
  });

  it("readBuffer returns null for a 404 metadata error", async () => {
    mockS3Send.mockImplementation((cmd: { __type: string }) => {
      if (cmd.__type === "GetObject") {
        return Promise.reject(
          Object.assign(new Error("nope"), {
            $metadata: { httpStatusCode: 404 },
          }),
        );
      }
      return Promise.resolve({});
    });

    const service = buildService();
    await expect(service.readBuffer("missing.bin")).resolves.toBeNull();
  });

  it("readBuffer rethrows unexpected errors", async () => {
    const failure = Object.assign(new Error("boom"), {
      name: "InternalError",
    });
    mockS3Send.mockImplementation((cmd: { __type: string }) => {
      if (cmd.__type === "GetObject") {
        return Promise.reject(failure);
      }
      return Promise.resolve({});
    });

    const service = buildService();
    await expect(service.readBuffer("a.bin")).rejects.toBe(failure);
  });

  it("readText decodes the downloaded buffer", async () => {
    mockS3Send.mockImplementation((cmd: { __type: string }) => {
      if (cmd.__type === "GetObject") {
        return Promise.resolve(s3Body("plain text"));
      }
      return Promise.resolve({});
    });

    const service = buildService();
    await expect(service.readText("a.txt")).resolves.toBe("plain text");
  });

  it("readText returns null when the object is missing", async () => {
    mockS3Send.mockImplementation((cmd: { __type: string }) => {
      if (cmd.__type === "GetObject") {
        return Promise.reject(
          Object.assign(new Error("nope"), {
            name: "NoSuchKey",
          }),
        );
      }
      return Promise.resolve({});
    });

    const service = buildService();
    await expect(service.readText("missing.txt")).resolves.toBeNull();
  });

  it("readJson parses the downloaded content", async () => {
    mockS3Send.mockImplementation((cmd: { __type: string }) => {
      if (cmd.__type === "GetObject") {
        return Promise.resolve(s3Body('{"value":7}'));
      }
      return Promise.resolve({});
    });

    const service = buildService();
    await expect(service.readJson("a.json")).resolves.toEqual({ value: 7 });
  });

  it("readJson returns null when the object is missing", async () => {
    mockS3Send.mockImplementation((cmd: { __type: string }) => {
      if (cmd.__type === "GetObject") {
        return Promise.reject(
          Object.assign(new Error("nope"), {
            name: "NoSuchKey",
          }),
        );
      }
      return Promise.resolve({});
    });

    const service = buildService();
    await expect(service.readJson("missing.json")).resolves.toBeNull();
  });

  it("readJson returns null for malformed JSON", async () => {
    mockS3Send.mockImplementation((cmd: { __type: string }) => {
      if (cmd.__type === "GetObject") {
        return Promise.resolve(s3Body("{not-json"));
      }
      return Promise.resolve({});
    });

    const service = buildService();
    await expect(service.readJson("a.json")).resolves.toBeNull();
  });

  it("delete returns true when the object is removed", async () => {
    const service = buildService();
    const result = await service.delete("a.txt");

    expect(DeleteObjectCommand).toHaveBeenCalledWith(
      expect.objectContaining({ Key: "a.txt" }),
    );
    expect(result).toBe(true);
  });

  it("delete returns false for a NoSuchKey error", async () => {
    mockS3Send.mockImplementation((cmd: { __type: string }) => {
      if (cmd.__type === "DeleteObject") {
        return Promise.reject(
          Object.assign(new Error("nope"), {
            name: "NoSuchKey",
          }),
        );
      }
      return Promise.resolve({});
    });

    const service = buildService();
    await expect(service.delete("missing.txt")).resolves.toBe(false);
  });

  it("delete returns false for a 404 metadata error", async () => {
    mockS3Send.mockImplementation((cmd: { __type: string }) => {
      if (cmd.__type === "DeleteObject") {
        return Promise.reject(
          Object.assign(new Error("nope"), {
            $metadata: { httpStatusCode: 404 },
          }),
        );
      }
      return Promise.resolve({});
    });

    const service = buildService();
    await expect(service.delete("missing.txt")).resolves.toBe(false);
  });

  it("delete rethrows unexpected errors", async () => {
    const failure = Object.assign(new Error("boom"), { name: "AccessDenied" });
    mockS3Send.mockImplementation((cmd: { __type: string }) => {
      if (cmd.__type === "DeleteObject") {
        return Promise.reject(failure);
      }
      return Promise.resolve({});
    });

    const service = buildService();
    await expect(service.delete("a.txt")).rejects.toBe(failure);
  });

  it("close destroys the underlying S3 client", async () => {
    const service = buildService();
    await service.close();
    expect(mockS3Destroy).toHaveBeenCalled();
  });
});

// ── DisabledStorageService ─────────────────────────────────────────────────
describe("DisabledStorageService", () => {
  const service = new DisabledStorageService();

  it("saveText returns null", async () => {
    await expect(service.saveText("a.txt", "x")).resolves.toBeNull();
  });

  it("saveJson returns null", async () => {
    await expect(service.saveJson("a.json", {})).resolves.toBeNull();
  });

  it("saveBuffer returns null", async () => {
    await expect(
      service.saveBuffer("a.bin", Buffer.from("x")),
    ).resolves.toBeNull();
  });

  it("readText returns null", async () => {
    await expect(service.readText("a.txt")).resolves.toBeNull();
  });

  it("readBuffer returns null", async () => {
    await expect(service.readBuffer("a.bin")).resolves.toBeNull();
  });

  it("readJson returns null", async () => {
    await expect(service.readJson("a.json")).resolves.toBeNull();
  });

  it("delete returns false", async () => {
    await expect(service.delete("a.txt")).resolves.toBe(false);
  });

  it("close resolves without doing anything", async () => {
    await expect(service.close()).resolves.toBeUndefined();
  });
});
