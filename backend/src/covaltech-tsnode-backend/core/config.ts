/**
 * @file core/config.ts
 * @description Manages the shared library configuration.
 */

import { SharedLibConfig } from "../types/config";

let config: SharedLibConfig | null = null;

/**
 * @function setSharedLibConfig
 * @description Sets the shared library configuration.
 * @param {SharedLibConfig} cfg - The configuration object to set.
 */
export const setSharedLibConfig = (cfg: SharedLibConfig) => {
  config = cfg;
};

/**
 * @function getSharedLibConfig
 * @description Retrieves the shared library configuration.
 * @throws Will throw an error if the configuration is not initialized.
 * @returns {SharedLibConfig} The shared library configuration.
 */
export const getSharedLibConfig = (): SharedLibConfig => {
  if (!config) {
    throw new Error(
      "SharedLib not initialized. Please call initSharedLib() first.",
    );
  }
  return config;
};
