import { z } from "zod";

// Documenso sends numeric or string ids depending on the field; normalise both
// to a trimmed string and drop empty values so the service layer only ever sees
// a usable id or nothing.
const documensoId = z
  .union([z.string(), z.number()])
  .transform((value) => String(value).trim())
  .optional();

const documensoRecipientSchema = z.object({
  token: z.string().nullish(),
  role: z.string().nullish(),
});

// Only the fields the webhook handler actually reads are validated. The payload
// is otherwise passed through with `.passthrough()` so unrelated Documenso
// fields do not fail validation.
export const documensoWebhookBodySchema = z
  .object({
    event: z.string().optional(),
    payload: z
      .object({
        id: documensoId,
        document: z.object({ id: documensoId }).passthrough().optional(),
        recipients: z.array(documensoRecipientSchema).optional(),
        Recipient: z.array(documensoRecipientSchema).optional(),
      })
      .passthrough()
      .optional(),
  })
  .passthrough();

export type DocumensoWebhookBody = z.infer<typeof documensoWebhookBodySchema>;
export type DocumensoWebhookRecipient = z.infer<
  typeof documensoRecipientSchema
>;
