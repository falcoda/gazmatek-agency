/**
 * @file core/init.ts
 * @description Initializes the shared library configuration.
 */

import { SharedLibConfig } from "../types/config";
import { setSharedLibConfig } from "./config";

/**
 * @function initSharedLib
 * @description Initializes the shared library with the provided configuration.
 * @param {SharedLibConfig} config - The shared library configuration.
 */
export const initSharedLib = (config: SharedLibConfig) => {
  setSharedLibConfig(config);

  if (!config.logger) {
    console.warn("[shared-lib] Logger config not provided");
  }
};
