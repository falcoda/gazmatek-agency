import pool from "@src/db/dbConnect";
import { completeArtistOnboarding } from "@src/db/query/artist/completeArtistOnboarding.types";
import { getArtistAccountById } from "@src/db/query/artistAccount/getArtistAccountById.types";
import { getContractByEnvelopeId } from "@src/db/query/contract/getContractByEnvelopeId.types";
import { markContractSigned } from "@src/db/query/contract/markContractSigned.types";
import { recordAudit } from "@src/helpers/audit";
import { config } from "@src/helpers/config";
import {
  AUDIT_ACTION,
  AUDIT_ACTOR_KIND,
  AUDIT_TARGET_KIND,
  CONTRACT_KIND,
  CONTRACT_STATUS,
} from "@src/helpers/constants/domain";
import { ERROR_MESSAGES } from "@src/helpers/error/constants";
import { ValidationError } from "@src/helpers/error/errors";
import logger from "@src/helpers/logger";
import type {
  DocumensoWebhookBody,
  DocumensoWebhookRecipient,
} from "@src/schemas/webhook";
import { SIGNED_PDF_SUFFIX } from "@src/services/contract/contractConstants";
import {
  DOCUMENSO_RECIPIENT_ROLE,
  downloadSignedEnvelope,
  getEnvelopeDetail,
} from "@src/services/documenso/documensoClient";
import { getStorageService } from "@src/services/storage";

// Documenso reports a fully-signed envelope as "COMPLETED".
const DOCUMENSO_ENVELOPE_COMPLETED = "COMPLETED";

export interface HandleSignedDocumentResult {
  // True when the document mapped to a known contract and was processed (or was
  // already processed). False when it was safely ignored because no contract
  // matched the envelope — the caller decides whether to ask Documenso to retry.
  processed: boolean;
}

/**
 * Orchestrates the side effects of a completed Documenso signature:
 * - resolves the contract from the envelope id
 * - (defense-in-depth, #57) confirms the envelope is actually completed and the
 *   signer matches the contract's artist before flipping state
 * - downloads the signed PDF and persists it to storage under the signed key (#10)
 * - marks the contract signed + completes onboarding + writes audit, all in one
 *   transaction, idempotent on contract.status='signed' (#39)
 *
 * The route owns HMAC verification, payload validation, and HTTP mapping; this
 * service owns the domain logic and stays transport-agnostic.
 */
export const handleSignedDocument = async (
  payload: DocumensoWebhookBody,
): Promise<HandleSignedDocumentResult> => {
  const documentId = extractDocumentId(payload);
  if (!documentId) {
    // Expected, caller-facing failure → AppError-derived ValidationError.
    throw new ValidationError(ERROR_MESSAGES.MISSING_DOCUMENT_ID);
  }

  const signingToken = extractSigningToken(payload);

  const contractRows = await getContractByEnvelopeId.run(
    { envelopeId: documentId },
    pool,
  );
  if (contractRows.length === 0) {
    logger.warn("Documenso webhook: contract not found for envelope", {
      documentId,
    });
    // #39 — unknown envelope on a completion event: do NOT swallow with 200.
    // Returning processed=false lets the route ask Documenso to retry, in case
    // the envelope id has not been persisted yet due to a race.
    return { processed: false };
  }

  const contract = contractRows[0];

  // Idempotency (#39): a retry of an already-signed contract is a no-op success.
  if (contract.status === CONTRACT_STATUS.SIGNED) {
    return { processed: true };
  }

  // #57 — defense-in-depth: confirm with Documenso that the envelope is actually
  // completed and the signer matches the contract's expected artist before we
  // flip any state. Best-effort: if Documenso is unreachable we log and fall
  // back to trusting the (HMAC-verified) webhook rather than blocking signing.
  await verifyEnvelopeWithDocumenso(documentId, contract.artist_id).catch(
    (error: unknown) => {
      logger.warn("Documenso webhook: envelope verification skipped", {
        documentId,
        error: error instanceof Error ? error.message : String(error),
      });
    },
  );

  const signedKey = `${contract.pdf_storage_key}${SIGNED_PDF_SUFFIX}`;

  // #10 — fetch and persist the signed PDF BEFORE flipping the contract to
  // signed, so signed_pdf_storage_key always points at real bytes. A download
  // failure aborts the whole transition and lets Documenso retry.
  await persistSignedPdf(documentId, signedKey);

  // #39 — sign + onboarding + audit run in a single transaction so a partial
  // failure never leaves the contract signed without the artist onboarded.
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const signed = await markContractSigned.run(
      { contractId: contract.id, signedPdfStorageKey: signedKey },
      client,
    );

    if (
      signed.length > 0 &&
      contract.kind === CONTRACT_KIND.ENGAGEMENT &&
      contract.artist_id
    ) {
      await completeArtistOnboarding.run(
        { artistId: contract.artist_id },
        client,
      );

      await recordAudit(
        {
          actorKind: AUDIT_ACTOR_KIND.SYSTEM,
          actorId: contract.artist_id,
          action: AUDIT_ACTION.ENGAGEMENT_CONTRACT_SIGN,
          targetKind: AUDIT_TARGET_KIND.CONTRACT,
          targetId: contract.id,
          metadata: { documentId, signingToken },
        },
        client,
      );
    }

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);
    throw error;
  } finally {
    client.release();
  }

  return { processed: true };
};

const persistSignedPdf = async (
  documentId: string,
  signedKey: string,
): Promise<void> => {
  const bytes = await downloadSignedEnvelope(
    config.documenso.url,
    config.documenso.apiKey,
    documentId,
    config.documenso.minioLocalEndpoint || undefined,
  );
  await getStorageService().saveBuffer(signedKey, bytes);
};

const verifyEnvelopeWithDocumenso = async (
  documentId: string,
  artistId: string | null,
): Promise<void> => {
  const detail = await getEnvelopeDetail(
    config.documenso.url,
    config.documenso.apiKey,
    documentId,
  );

  if (detail.status.toUpperCase() !== DOCUMENSO_ENVELOPE_COMPLETED) {
    throw new ValidationError(
      `Documenso envelope ${documentId} is not completed (status=${detail.status})`,
    );
  }

  if (!artistId) return;

  const accountRows = await getArtistAccountById.run({ artistId }, pool);
  const expectedEmail = accountRows[0]?.email?.toLowerCase();
  if (!expectedEmail) return;

  const signer = detail.recipients.find(
    (recipient) => recipient.role === DOCUMENSO_RECIPIENT_ROLE.SIGNER,
  );
  const signerEmail = signer?.email?.toLowerCase();
  if (signerEmail && signerEmail !== expectedEmail) {
    throw new ValidationError(
      `Documenso signer (${signerEmail}) does not match the contract artist`,
    );
  }
};

const extractDocumentId = (payload: DocumensoWebhookBody): string | null => {
  const directId = payload.payload?.id;
  if (directId && directId.length > 0) {
    return directId;
  }

  const documentId = payload.payload?.document?.id;
  if (documentId && documentId.length > 0) {
    return documentId;
  }

  return null;
};

const extractSigningToken = (payload: DocumensoWebhookBody): string | null => {
  const recipients: DocumensoWebhookRecipient[] =
    payload.payload?.recipients ?? payload.payload?.Recipient ?? [];
  const signer = recipients.find(
    (recipient) => recipient.role === DOCUMENSO_RECIPIENT_ROLE.SIGNER,
  );
  return (signer ?? recipients[0])?.token ?? null;
};
