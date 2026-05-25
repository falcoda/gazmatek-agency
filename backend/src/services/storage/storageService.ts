import { config } from "@src/helpers/config";
import { DisabledStorageService } from "@src/services/storage/drivers/disabled";
import { LocalStorageService } from "@src/services/storage/drivers/local";
import { S3StorageService } from "@src/services/storage/drivers/s3";
import { StorageService } from "@src/services/storage/types";
import { STORAGE_DRIVER } from "@src/types/config";

let storageService: StorageService | null = null;

export const getStorageService = (): StorageService => {
  if (!storageService) {
    if (!config.storage.enabled) {
      storageService = new DisabledStorageService();
      return storageService;
    }

    if (config.storage.driver === STORAGE_DRIVER.S3) {
      storageService = new S3StorageService();
    } else {
      storageService = new LocalStorageService();
    }
  }

  return storageService;
};

export const closeStorageService = async (): Promise<void> => {
  if (!storageService) {
    return;
  }

  await storageService.close();
  storageService = null;
};
