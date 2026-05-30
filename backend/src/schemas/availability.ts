import { z } from "zod";

export const availabilityQuerySchema = z.object({
  from: z.iso.datetime({ offset: true }).or(z.iso.date()),
  to: z.iso.datetime({ offset: true }).or(z.iso.date()),
});

export const availabilityParamsSchema = z.object({
  id: z.guid(),
});

const SOURCE = ["personal", "external_gig"] as const;

export const createUnavailabilityBodySchema = z
  .object({
    startsAt: z.iso.datetime({ offset: true }),
    endsAt: z.iso.datetime({ offset: true }),
    source: z.enum(SOURCE),
    externalEventTitle: z.string().trim().min(1).max(200).optional(),
    externalEventLocation: z.string().trim().min(1).max(200).optional(),
    notes: z.string().trim().max(2000).optional(),
  })
  .superRefine((data, ctx) => {
    if (
      data.source === "external_gig" &&
      (!data.externalEventTitle || data.externalEventTitle.length === 0)
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["externalEventTitle"],
        message: "externalEventTitle is required when source is external_gig",
      });
    }
    if (new Date(data.endsAt).getTime() <= new Date(data.startsAt).getTime()) {
      ctx.addIssue({
        code: "custom",
        path: ["endsAt"],
        message: "endsAt must be after startsAt",
      });
    }
  });

export const unavailabilityIdParamsSchema = z.object({
  id: z.guid(),
});

export type CreateUnavailabilityBody = z.infer<
  typeof createUnavailabilityBodySchema
>;
