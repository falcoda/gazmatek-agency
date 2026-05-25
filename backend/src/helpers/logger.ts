import { getLogger } from "@lib/modules/logger";

import { config } from "./config";

// void config ensures @src/helpers/config (and its initSharedLib side-effect) is
// evaluated before getLogger() is called, regardless of import order.
void config;

export const logger = getLogger();
export default logger;
