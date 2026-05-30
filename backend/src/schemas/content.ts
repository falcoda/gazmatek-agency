import { SUPPORTED_LOCALES } from "@src/helpers/constants/domain";
import { z } from "zod";

export const getPublicContentQuerySchema = z.object({
  lang: z.enum(SUPPORTED_LOCALES).optional(),
});

export type GetPublicContentQuery = z.infer<typeof getPublicContentQuerySchema>;
