import { z } from "zod";

// #23 — bounded validation for PUT /api/agency/info. Every field is optional and
// nullable: the admin form sends a partial settings object and may clear a field
// by sending null/"". Email is validated when a non-empty value is present.
const optionalText = (max: number) => z.string().trim().max(max).nullish();

export const updateAgencyInfoBodySchema = z.object({
  name: optionalText(200),
  representative: optionalText(200),
  address: optionalText(500),
  city: optionalText(120),
  companyNumber: optionalText(50),
  vatNumber: optionalText(50),
  // Allow empty string / null (clears the field); otherwise must be an email.
  email: z.union([z.literal(""), z.email().max(200)]).nullish(),
  iban: optionalText(50),
});

export type UpdateAgencyInfoBody = z.infer<typeof updateAgencyInfoBodySchema>;
