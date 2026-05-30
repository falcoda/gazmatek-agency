import { listBookingsOverlapping } from "@src/db/query/booking/listBookingsOverlapping.types";
import { createUnavailability } from "@src/db/query/unavailability/createUnavailability.types";
import { deleteUnavailability } from "@src/db/query/unavailability/deleteUnavailability.types";
import { getUnavailabilityById } from "@src/db/query/unavailability/getUnavailabilityById.types";
import { listUnavailabilitiesInRange } from "@src/db/query/unavailability/listUnavailabilitiesInRange.types";
import { BOOKING_STATUS } from "@src/helpers/constants/domain";
import {
  ConflictError,
  ForbiddenError,
  InternalError,
  NotFoundError,
} from "@src/helpers/error/errors";
import type { CreateUnavailabilityBody } from "@src/schemas/availability";
import { Pool } from "pg";

type UnavailabilitySource = "personal" | "external_gig";
type CreatedByKind = "artist" | "admin";

export interface UnavailabilityDto {
  id: string;
  artistId: string;
  startsAt: Date;
  endsAt: Date;
  source: UnavailabilitySource;
  externalEventTitle: string | null;
  externalEventLocation: string | null;
  notes: string | null;
}

interface CreateArgs {
  artistId: string;
  actorKind: CreatedByKind;
  actorId: string;
  input: CreateUnavailabilityBody;
}

export class UnavailabilityService {
  constructor(private db: Pool) {}

  async listForArtist(
    artistId: string,
    from: Date,
    to: Date,
  ): Promise<UnavailabilityDto[]> {
    const rows = await listUnavailabilitiesInRange.run(
      { artistId, rangeStart: from, rangeEnd: to },
      this.db,
    );
    return rows.map((row) => ({
      id: row.id,
      artistId: row.artist_id,
      startsAt: row.starts_at,
      endsAt: row.ends_at,
      source: row.source as UnavailabilitySource,
      externalEventTitle: row.external_event_title,
      externalEventLocation: row.external_event_location,
      notes: row.notes,
    }));
  }

  async create(args: CreateArgs): Promise<UnavailabilityDto> {
    const startsAt = new Date(args.input.startsAt);
    const endsAt = new Date(args.input.endsAt);

    const conflicts = await listBookingsOverlapping.run(
      {
        artistId: args.artistId,
        rangeStart: startsAt,
        rangeEnd: endsAt,
      },
      this.db,
    );
    const confirmedConflict = conflicts.find(
      (c) => c.status === BOOKING_STATUS.CONFIRMED,
    );
    if (confirmedConflict) {
      throw new ConflictError(
        "Unavailability conflicts with a confirmed booking",
      );
    }

    const rows = await createUnavailability.run(
      {
        artistId: args.artistId,
        startsAt,
        endsAt,
        source: args.input.source,
        externalEventTitle: args.input.externalEventTitle ?? null,
        externalEventLocation: args.input.externalEventLocation ?? null,
        notes: args.input.notes ?? null,
        createdByKind: args.actorKind,
        createdBy: args.actorId,
      },
      this.db,
    );
    if (rows.length === 0) {
      throw new InternalError("Unavailability insert failed");
    }
    const row = rows[0];
    return {
      id: row.id,
      artistId: row.artist_id,
      startsAt: row.starts_at,
      endsAt: row.ends_at,
      source: row.source as UnavailabilitySource,
      externalEventTitle: row.external_event_title,
      externalEventLocation: row.external_event_location,
      notes: row.notes,
    };
  }

  async deleteForArtist(args: {
    unavailabilityId: string;
    artistId: string;
    enforceArtistOwnership: boolean;
  }): Promise<void> {
    const existing = await getUnavailabilityById.run(
      { unavailabilityId: args.unavailabilityId },
      this.db,
    );
    if (existing.length === 0) {
      throw new NotFoundError("Unavailability not found");
    }
    if (
      args.enforceArtistOwnership &&
      existing[0].artist_id !== args.artistId
    ) {
      throw new ForbiddenError("Cannot delete another artist's unavailability");
    }

    const rows = await deleteUnavailability.run(
      {
        unavailabilityId: args.unavailabilityId,
        enforceArtistId: args.enforceArtistOwnership,
        artistId: args.artistId,
      },
      this.db,
    );
    if (rows.length === 0) {
      throw new NotFoundError("Unavailability not found");
    }
  }
}

export default UnavailabilityService;
