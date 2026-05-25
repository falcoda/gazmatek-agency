/**
 * @file core/env.ts
 * @description Handles environment variable loading and validation.
 */

import dotenv from "dotenv";
import fs from "fs";
import path from "path";

/**
 * @function loadEnvFile
 * @description Loads environment variables from a specified .env file.
 * @param {string} [filePath=".env"] - The path to the .env file.
 */
export const loadEnvFile = (filePath = ".env") => {
  const envFilePath = path.resolve(process.cwd(), filePath);

  if (fs.existsSync(envFilePath)) {
    dotenv.config({ path: envFilePath });
    console.log(`[env] Loaded environment from ${envFilePath}`);
  } else {
    console.error(`[env] Environment file ${envFilePath} not found.`);
    process.exit(1);
  }
};

/**
 * @function checkEnvVariables
 * @description Validates that all required environment variables are set.
 * @param {string[]} requiredVars - An array of required environment variable names.
 */
export const checkEnvVariables = (requiredVars: string[]) => {
  requiredVars.forEach((variable) => {
    if (!process.env[variable]) {
      console.error(`[env] Missing required environment variable: ${variable}`);
      process.exit(1);
    }
  });
};
