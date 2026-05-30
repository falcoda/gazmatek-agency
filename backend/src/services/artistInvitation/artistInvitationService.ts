import {
  createArtistAccount,
  ICreateArtistAccountResult,
} from "@src/db/query/artistAccount/createArtistAccount.types";
import { getArtistAccountByEmail } from "@src/db/query/artistAccount/getArtistAccountByEmail.types";
import { artistSlugExists } from "@src/db/query/artistAdmin/artistSlugExists.types";
import { deleteArtist } from "@src/db/query/artistAdmin/deleteArtist.types";
import { insertArtistFromInvitation } from "@src/db/query/artistAdmin/insertArtistFromInvitation.types";
import {
  type artist_invitation_status,
  countArtistInvitations,
} from "@src/db/query/artistInvitation/countArtistInvitations.types";
import { createArtistInvitation } from "@src/db/query/artistInvitation/createArtistInvitation.types";
import { getArtistInvitationById } from "@src/db/query/artistInvitation/getArtistInvitationById.types";
import { getArtistInvitationByTokenHash } from "@src/db/query/artistInvitation/getArtistInvitationByTokenHash.types";
import { listArtistInvitations } from "@src/db/query/artistInvitation/listArtistInvitations.types";
import { markArtistInvitationAccepted } from "@src/db/query/artistInvitation/markArtistInvitationAccepted.types";
import { revokeArtistInvitation } from "@src/db/query/artistInvitation/revokeArtistInvitation.types";
import { rotateArtistInvitationToken } from "@src/db/query/artistInvitation/rotateArtistInvitationToken.types";
import { recordAudit } from "@src/helpers/audit";
import { signIdentityToken, UserKind } from "@src/helpers/auth/identity";
import { hashPassword } from "@src/helpers/auth/password";
import { isPasswordTooShort } from "@src/helpers/auth/passwordPolicy";
import { generateRawToken, hashToken } from "@src/helpers/auth/tokens";
import { config } from "@src/helpers/config";
import { ArtistLevel, ArtistSetType } from "@src/helpers/constants/artist";
import {
  ConflictError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from "@src/helpers/error/errors";
import { logger } from "@src/helpers/logger";
import { issueRefreshToken } from "@src/services/auth/identityRefreshService";
import {
  EmailLocale,
  EmailTemplate,
  getEmailQueue,
} from "@src/services/mailer/queueService";
import { Pool } from "pg";

const INVITATION_TTL_DAYS = 7;
const MS_PER_DAY = 24 * 60 * 60 * 1000;
const MAX_SLUG_ATTEMPTS = 10;
const SLUG_MAX_LENGTH = 40;

// Re-export the single source of truth so callers can keep importing these
// unions from the service if needed (Rule 4: no parallel string literals).
export { ArtistLevel, ArtistSetType };
export type ArtistInvitationStatus = artist_invitation_status;

export interface CreateArtistInvitationInput {
  email: string;
  stageName: string;
  level: ArtistLevel;
  setType: ArtistSetType;
  customMessage?: string;
  invitedBy: string;
  locale: EmailLocale;
}

export interface ArtistInvitationAdminDto {
  id: string;
  email: string;
  stageName: string;
  level: ArtistLevel;
  setType: ArtistSetType;
  customMessage: string | null;
  status: ArtistInvitationStatus;
  expiresAt: string;
  acceptedAt: string | null;
  artistId: string | null;
  lastResentAt: string | null;
  resendCount: number;
  createdAt: string;
}

export interface CreateArtistInvitationResult {
  invitation: ArtistInvitationAdminDto;
  invitationUrl: string;
}

export interface ArtistInvitationPublicDto {
  email: string;
  stage_name: string;
  level: string;
  set_type: string;
}

export interface AcceptArtistInvitationInput {
  password: string;
  cguAccepted: boolean;
  privacyAccepted: boolean;
}

export interface AcceptArtistInvitationResult {
  token: string;
  refreshToken: string;
  expiresInSeconds: number;
  refreshExpiresInSeconds: number;
  artist: {
    id: string;
    email: string;
    slug: string;
    stageName: string;
  };
}

export interface ListArtistInvitationsParams {
  status?: ArtistInvitationStatus;
  search?: string;
  page: number;
  pageSize: number;
}

export interface ListArtistInvitationsResult {
  data: ArtistInvitationAdminDto[];
  pagination: { page: number; pageSize: number; total: number };
}

const COMBINING_DIACRITICS = /[̀-ͯ]/g;
const SLUG_INVALID_CHARS = /[^a-z0-9]+/g;
const SLUG_TRIM_DASHES = /^-+|-+$/g;

function slugify(input: string): string {
  const base = input
    .toLowerCase()
    .normalize("NFD")
    .replace(COMBINING_DIACRITICS, "")
    .replace(SLUG_INVALID_CHARS, "-")
    .replace(SLUG_TRIM_DASHES, "")
    .slice(0, SLUG_MAX_LENGTH);
  return base.length > 0 ? base : "artist";
}

function buildInvitationUrl(rawToken: string, locale: EmailLocale): string {
  const baseUrl = (config.app.baseUrl ?? "").replace(/\/+$/, "");
  return `${baseUrl}/${locale}/artist/invitation?token=${rawToken}`;
}

interface AdminInvitationRow {
  id: string;
  email: string;
  stage_name: string;
  level: string;
  set_type: string;
  custom_message?: string | null;
  status: artist_invitation_status;
  expires_at: Date;
  accepted_at: Date | null;
  artist_id: string | null;
  last_resent_at: Date | null;
  resend_count: number;
  created_at: Date;
}

function toAdminDto(row: AdminInvitationRow): ArtistInvitationAdminDto {
  return {
    id: row.id,
    email: row.email,
    stageName: row.stage_name,
    level: row.level as ArtistLevel,
    setType: row.set_type as ArtistSetType,
    customMessage: row.custom_message ?? null,
    status: row.status,
    expiresAt: row.expires_at.toISOString(),
    acceptedAt: row.accepted_at ? row.accepted_at.toISOString() : null,
    artistId: row.artist_id ?? null,
    lastResentAt: row.last_resent_at ? row.last_resent_at.toISOString() : null,
    resendCount: row.resend_count,
    createdAt: row.created_at.toISOString(),
  };
}

export class ArtistInvitationService {
  constructor(private db: Pool) {}

  async create(
    input: CreateArtistInvitationInput,
  ): Promise<CreateArtistInvitationResult> {
    const email = input.email.toLowerCase().trim();

    const existing = await getArtistAccountByEmail.run({ email }, this.db);
    if (existing.length > 0) {
      throw new ConflictError(
        "An artist account already exists for this email",
      );
    }

    const rawToken = generateRawToken();
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + INVITATION_TTL_DAYS * MS_PER_DAY);

    const rows = await createArtistInvitation.run(
      {
        email,
        stageName: input.stageName.trim(),
        level: input.level,
        setType: input.setType,
        customMessage: input.customMessage?.trim() || null,
        tokenHash,
        expiresAt,
        invitedBy: input.invitedBy,
      },
      this.db,
    );
    const invitation = rows[0];

    const invitationUrl = buildInvitationUrl(rawToken, input.locale);

    await getEmailQueue().enqueue({
      template: EmailTemplate.ARTIST_INVITATION,
      recipient: email,
      locale: input.locale,
      payload: {
        stageName: invitation.stage_name,
        invitationUrl,
        customMessage: invitation.custom_message ?? "",
        expiresAt: invitation.expires_at.toISOString(),
      },
    });

    await recordAudit({
      actorKind: "admin",
      actorId: input.invitedBy,
      action: "artist_invitation.create",
      targetKind: "artist_invitation",
      targetId: invitation.id,
      metadata: { email, stageName: invitation.stage_name },
    });

    return { invitation: toAdminDto(invitation), invitationUrl };
  }

  async getByToken(
    rawToken: string,
  ): Promise<ArtistInvitationPublicDto | null> {
    const tokenHash = hashToken(rawToken);
    const rows = await getArtistInvitationByTokenHash.run(
      { tokenHash },
      this.db,
    );
    if (rows.length === 0) return null;
    const invitation = rows[0];
    if (invitation.status !== "pending") return null;
    if (invitation.expires_at.getTime() <= Date.now()) return null;
    return {
      email: invitation.email,
      stage_name: invitation.stage_name,
      level: invitation.level,
      set_type: invitation.set_type,
    };
  }

  async accept(
    rawToken: string,
    input: AcceptArtistInvitationInput,
  ): Promise<AcceptArtistInvitationResult> {
    if (!input.cguAccepted || !input.privacyAccepted) {
      throw new ValidationError("Terms and privacy must be accepted");
    }
    if (isPasswordTooShort(input.password)) {
      throw new ValidationError("Password is too short");
    }

    const tokenHash = hashToken(rawToken);
    const invitationRows = await getArtistInvitationByTokenHash.run(
      { tokenHash },
      this.db,
    );
    if (invitationRows.length === 0) {
      throw new UnauthorizedError("Invalid invitation");
    }
    const invitation = invitationRows[0];
    if (invitation.status !== "pending") {
      throw new ConflictError("Invitation is no longer pending");
    }
    if (invitation.expires_at.getTime() <= Date.now()) {
      throw new UnauthorizedError("Invitation expired");
    }

    // Defensive check: even though create() guards against duplicates, an
    // artist_account could have been provisioned via another path between the
    // invitation being sent and the artist clicking the link.
    const dupe = await getArtistAccountByEmail.run(
      { email: invitation.email },
      this.db,
    );
    if (dupe.length > 0) {
      throw new ConflictError("Artist account already exists");
    }

    const slug = await this.allocateUniqueSlug(invitation.stage_name);
    const passwordHash = await hashPassword(input.password);

    const artistRows = await insertArtistFromInvitation.run(
      {
        slug,
        stageName: invitation.stage_name,
        level: invitation.level as ArtistLevel,
        setType: invitation.set_type as ArtistSetType,
      },
      this.db,
    );
    const artist = artistRows[0];

    let account: ICreateArtistAccountResult;
    try {
      const accountRows = await createArtistAccount.run(
        {
          artistId: artist.id,
          email: invitation.email,
          passwordHash,
        },
        this.db,
      );
      account = accountRows[0];
    } catch (error) {
      // Roll back the artist row to avoid an orphan if the account insert
      // fails (e.g. unique-email race). artist_accounts is removed in cascade
      // via the artist_accounts.artist_id ON DELETE CASCADE FK (migration 001),
      // so deleting the artist is enough.
      await this.rollbackArtist(artist.id, "account_insert_failed");
      throw error;
    }

    const accepted = await markArtistInvitationAccepted.run(
      { invitationId: invitation.id, artistId: artist.id },
      this.db,
    );
    if (accepted.length === 0) {
      // Another concurrent acceptance won the race. Undo our writes (the
      // artist_account is cascaded away with the artist).
      await this.rollbackArtist(artist.id, "invitation_already_used");
      throw new ConflictError("Invitation already used");
    }

    const signed = signIdentityToken({
      data: account.email,
      kind: UserKind.ARTIST,
      sub: artist.id,
    });
    const refresh = await issueRefreshToken(this.db, "artist", artist.id);

    await recordAudit({
      actorKind: "artist",
      actorId: artist.id,
      action: "artist_invitation.accept",
      targetKind: "artist_invitation",
      targetId: invitation.id,
    });

    return {
      token: signed.token,
      refreshToken: refresh.rawToken,
      expiresInSeconds: signed.expiresInSeconds,
      refreshExpiresInSeconds: refresh.expiresInSeconds,
      artist: {
        id: artist.id,
        email: account.email,
        slug: artist.slug,
        stageName: artist.stage_name,
      },
    };
  }

  async list(
    params: ListArtistInvitationsParams,
  ): Promise<ListArtistInvitationsResult> {
    const offset = (params.page - 1) * params.pageSize;
    const [rows, countRows] = await Promise.all([
      listArtistInvitations.run(
        {
          statusFilter: params.status ?? null,
          searchTerm: params.search ?? null,
          pageLimit: params.pageSize,
          pageOffset: offset,
        },
        this.db,
      ),
      countArtistInvitations.run(
        {
          statusFilter: params.status ?? null,
          searchTerm: params.search ?? null,
        },
        this.db,
      ),
    ]);
    return {
      data: rows.map((row) => toAdminDto({ ...row, custom_message: null })),
      pagination: {
        page: params.page,
        pageSize: params.pageSize,
        total: countRows[0]?.total ?? 0,
      },
    };
  }

  async resend(
    invitationId: string,
    locale: EmailLocale,
    actorId: string,
    skipEmail = false,
  ): Promise<CreateArtistInvitationResult> {
    const rawToken = generateRawToken();
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + INVITATION_TTL_DAYS * MS_PER_DAY);

    const rows = await rotateArtistInvitationToken.run(
      { invitationId, tokenHash, expiresAt },
      this.db,
    );
    if (rows.length === 0) {
      const existing = await getArtistInvitationById.run(
        { invitationId },
        this.db,
      );
      if (existing.length === 0) {
        throw new NotFoundError("Invitation not found");
      }
      throw new ConflictError(
        `Invitation is ${existing[0].status} and cannot be resent`,
      );
    }
    const invitation = rows[0];

    const invitationUrl = buildInvitationUrl(rawToken, locale);

    if (!skipEmail) {
      await getEmailQueue().enqueue({
        template: EmailTemplate.ARTIST_INVITATION,
        recipient: invitation.email,
        locale,
        payload: {
          stageName: invitation.stage_name,
          invitationUrl,
          customMessage: invitation.custom_message ?? "",
          expiresAt: invitation.expires_at.toISOString(),
        },
      });
    }

    await recordAudit({
      actorKind: "admin",
      actorId,
      action: skipEmail
        ? "artist_invitation.rotate_link"
        : "artist_invitation.resend",
      targetKind: "artist_invitation",
      targetId: invitation.id,
    });

    // Rotate response doesn't include artist_id/accepted_at fields — by
    // construction (status is back to 'pending') they're null.
    const adminDto = toAdminDto({
      id: invitation.id,
      email: invitation.email,
      stage_name: invitation.stage_name,
      level: invitation.level,
      set_type: invitation.set_type,
      custom_message: invitation.custom_message,
      status: invitation.status,
      expires_at: invitation.expires_at,
      accepted_at: null,
      artist_id: null,
      last_resent_at: invitation.last_resent_at,
      resend_count: invitation.resend_count,
      created_at: invitation.created_at,
    });
    return { invitation: adminDto, invitationUrl };
  }

  async revoke(
    invitationId: string,
    actorId: string,
  ): Promise<ArtistInvitationAdminDto> {
    const updated = await revokeArtistInvitation.run({ invitationId }, this.db);
    if (updated.length === 0) {
      const existing = await getArtistInvitationById.run(
        { invitationId },
        this.db,
      );
      if (existing.length === 0) {
        throw new NotFoundError("Invitation not found");
      }
      throw new ConflictError(
        `Invitation is ${existing[0].status} and cannot be revoked`,
      );
    }

    await recordAudit({
      actorKind: "admin",
      actorId,
      action: "artist_invitation.revoke",
      targetKind: "artist_invitation",
      targetId: invitationId,
    });

    const refreshed = await getArtistInvitationById.run(
      { invitationId },
      this.db,
    );
    return toAdminDto(refreshed[0]);
  }

  // Compensating rollback for the non-transactional accept() flow. Uses the
  // generated pgtyped `deleteArtist` query (Rule 1: no raw SQL in services).
  // artist_accounts rows are removed in cascade through the FK. A failure of
  // the rollback itself is logged with context rather than swallowed silently.
  private async rollbackArtist(
    artistId: string,
    reason: string,
  ): Promise<void> {
    try {
      await deleteArtist.run({ artistId }, this.db);
    } catch (error) {
      logger.error(
        "Failed to roll back orphaned artist after invitation accept",
        {
          artistId,
          reason,
          error: error instanceof Error ? error.message : String(error),
        },
      );
    }
  }

  private async allocateUniqueSlug(stageName: string): Promise<string> {
    const base = slugify(stageName);
    for (let attempt = 0; attempt < MAX_SLUG_ATTEMPTS; attempt += 1) {
      const candidate =
        attempt === 0
          ? base
          : `${base}-${Math.floor(Math.random() * 9000) + 1000}`;
      const rows = await artistSlugExists.run({ slug: candidate }, this.db);
      if (!rows[0]?.slug_exists) return candidate;
    }
    // Extremely unlikely fallback: append timestamp to guarantee uniqueness.
    return `${base}-${Date.now()}`;
  }
}

export default ArtistInvitationService;
