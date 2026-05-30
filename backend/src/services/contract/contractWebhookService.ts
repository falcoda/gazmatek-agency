import pool from "@src/db/dbConnect";
import { completeArtistOnboarding } from "@src/db/query/artist/completeArtistOnboarding.types";
import { getContractByEnvelopeId } from "@src/db/query/contract/getContractByEnvelopeId.types";
import { markContractSigned } from "@src/db/query/contract/markContractSigned.types";
import { recordAudit } from "@src/helpers/audit";
import {
  AUDIT_ACTION,
  AUDIT_ACTOR_KIND,
  AUDIT_TARGET_KIND,
  CONTRACT_KIND,
} from "@src/helpers/constants/domain";
import { ERROR_MESSAGES } from "@src/helpers/error/constants";
import { ValidationError } from "@src/helpers/error/errors";
import logger from "@src/helpers/logger";
import type {
  DocumensoWebhookBody,
  DocumensoWebhookRecipient,
} from "@src/schemas/webhook";
import { SIGNED_PDF_SUFFIX } from "@src/services/contract/contractConstants";
import { DOCUMENSO_RECIPIENT_ROLE } from "@src/services/documenso/documensoClient";

export interface HandleSignedDocumentResult {
  // True when the document mapped to a known contract and was processed,
  // false when it was safely ignored (contract not found for the envelope).
  processed: boolean;
}

/**
 * Orchestrates the side effects of a completed Documenso signature:
 * - resolves the contract from the envelope id
 * - marks the contract as signed and stores the signed PDF key
 * - completes artist onboarding for engagement contracts
 * - records the audit trail
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
    return { processed: false };
  }

  const contract = contractRows[0];
  const signedKey = `${contract.pdf_storage_key}${SIGNED_PDF_SUFFIX}`;
  const signed = await markContractSigned.run(
    { contractId: contract.id, signedPdfStorageKey: signedKey },
    pool,
  );

  if (
    signed.length > 0 &&
    contract.kind === CONTRACT_KIND.ENGAGEMENT &&
    contract.artist_id
  ) {
    await completeArtistOnboarding.run({ artistId: contract.artist_id }, pool);

    await recordAudit({
      actorKind: AUDIT_ACTOR_KIND.SYSTEM,
      actorId: contract.artist_id,
      action: AUDIT_ACTION.ENGAGEMENT_CONTRACT_SIGN,
      targetKind: AUDIT_TARGET_KIND.CONTRACT,
      targetId: contract.id,
      metadata: { documentId, signingToken },
    });
  }

  return { processed: true };
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
