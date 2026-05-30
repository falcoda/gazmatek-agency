import logger from "@src/helpers/logger";
import http from "http";
import { URL as NodeURL } from "url";

interface DocumensoRecipient {
  id: number;
  email: string;
  name: string;
  role: string;
  signingStatus: string;
  signingUrl: string | null;
  token: string | null;
}

interface DocumensoEnvelopeItem {
  id: string;
}

interface DocumensoEnvelope {
  id: string;
  title: string;
  status: string;
  recipients: DocumensoRecipient[];
}

interface DocumensoEnvelopeDetail extends DocumensoEnvelope {
  envelopeItems: DocumensoEnvelopeItem[];
}

export const DOCUMENSO_RECIPIENT_ROLE = {
  SIGNER: "SIGNER",
  CC: "CC",
} as const;

export type DocumensoRecipientRole =
  (typeof DOCUMENSO_RECIPIENT_ROLE)[keyof typeof DOCUMENSO_RECIPIENT_ROLE];

// Documenso API literals (Rule 4: no magic strings).
const DOCUMENSO_ENVELOPE_TYPE = "DOCUMENT";

const DOCUMENSO_FIELD_TYPE = {
  SIGNATURE: "SIGNATURE",
} as const;

const DOCUMENSO_DISTRIBUTION_METHOD = {
  EMAIL: "EMAIL",
  NONE: "NONE",
} as const;

// Signature field placement, expressed as percentages of the A4 page. Anchored
// on the right column ("For the Artist" cell) of the signature table produced by
// `renderEngagementContractHtml`.
const SIGNATURE_FIELD_POSITION = {
  positionX: 55,
  positionY: 32,
  width: 35,
  height: 6,
} as const;

interface DocumensoRecipientInput {
  email: string;
  name: string;
  role: DocumensoRecipientRole;
  signingOrder: number;
}

const authHeader = (apiKey: string) => ({ Authorization: apiKey });

const handleResponse = async (
  response: Response,
  context: string,
): Promise<unknown> => {
  if (!response.ok) {
    const body = await response.text().catch(() => "");
    logger.warn(`Documenso ${context} failed`, {
      status: response.status,
      body,
    });
    throw new Error(`Documenso ${context} error (${response.status}): ${body}`);
  }

  return response.json();
};

export const createEnvelopeFromPdf = async (
  baseUrl: string,
  apiKey: string,
  pdfBuffer: Buffer,
  title: string,
  signer: { email: string; name: string },
  confirmationRecipient?: { email: string; name: string },
): Promise<DocumensoEnvelope> => {
  const form = new FormData();
  const recipients: DocumensoRecipientInput[] = [
    {
      email: signer.email,
      name: signer.name,
      role: DOCUMENSO_RECIPIENT_ROLE.SIGNER,
      signingOrder: 1,
    },
  ];

  if (confirmationRecipient) {
    // CC recipient receives the signed-contract confirmation email without
    // having to sign — used to route confirmations to the agency.
    recipients.push({
      email: confirmationRecipient.email,
      name: confirmationRecipient.name,
      role: DOCUMENSO_RECIPIENT_ROLE.CC,
      signingOrder: 2,
    });
  }

  const payload = JSON.stringify({
    type: DOCUMENSO_ENVELOPE_TYPE,
    title,
    recipients,
    meta: {
      subject: title,
      message: `Please sign: ${title}`,
      emailSettings: {
        documentCompleted: true,
        ownerDocumentCompleted: false,
      },
    },
    distributeDocument: false,
  });

  form.append("payload", payload);

  const blob = new Blob([new Uint8Array(pdfBuffer)], {
    type: "application/pdf",
  });
  form.append("files", blob, `${title}.pdf`);

  const response = await fetch(`${baseUrl}/api/v2/envelope/create`, {
    method: "POST",
    headers: authHeader(apiKey),
    body: form,
  });

  const json = (await handleResponse(response, "envelope/create")) as Record<
    string,
    unknown
  >;
  const envelope = normalizeEnvelope(json);

  if (!envelope) {
    throw new Error("Documenso envelope/create returned no id");
  }

  return envelope;
};

export const distributeEnvelope = async (
  baseUrl: string,
  apiKey: string,
  envelopeId: string,
  sendEmail = true,
): Promise<DocumensoEnvelope> => {
  const response = await fetch(`${baseUrl}/api/v2/envelope/distribute`, {
    method: "POST",
    headers: { ...authHeader(apiKey), "Content-Type": "application/json" },
    body: JSON.stringify({
      envelopeId,
      meta: {
        distributionMethod: sendEmail
          ? DOCUMENSO_DISTRIBUTION_METHOD.EMAIL
          : DOCUMENSO_DISTRIBUTION_METHOD.NONE,
      },
    }),
  });

  const json = (await handleResponse(
    response,
    "envelope/distribute",
  )) as Record<string, unknown>;
  const envelope = normalizeEnvelope(json);

  if (!envelope) {
    throw new Error("Documenso envelope/distribute returned unexpected shape");
  }

  return envelope;
};

export const getEnvelopeDetail = async (
  baseUrl: string,
  apiKey: string,
  envelopeId: string,
): Promise<DocumensoEnvelopeDetail> => {
  const response = await fetch(
    `${baseUrl}/api/v2/envelope/${encodeURIComponent(envelopeId)}`,
    { headers: authHeader(apiKey) },
  );

  const json = (await handleResponse(response, "envelope/get")) as Record<
    string,
    unknown
  >;

  if (typeof json.id !== "string" && typeof json.id !== "number") {
    throw new Error("Documenso envelope/get returned unexpected shape");
  }

  const recipients = Array.isArray(json.recipients)
    ? (json.recipients as DocumensoRecipient[])
    : [];
  const envelopeItems = Array.isArray(json.envelopeItems)
    ? (json.envelopeItems as DocumensoEnvelopeItem[])
    : [];

  return {
    id: String(json.id),
    title: String(json.title ?? ""),
    status: String(json.status ?? ""),
    recipients,
    envelopeItems,
  };
};

export const addSignatureField = async (
  baseUrl: string,
  apiKey: string,
  envelopeId: string,
  recipientId: number,
  envelopeItemId: string,
  page: number,
): Promise<void> => {
  const response = await fetch(`${baseUrl}/api/v2/envelope/field/create-many`, {
    method: "POST",
    headers: { ...authHeader(apiKey), "Content-Type": "application/json" },
    body: JSON.stringify({
      envelopeId,
      data: [
        {
          type: DOCUMENSO_FIELD_TYPE.SIGNATURE,
          recipientId,
          envelopeItemId,
          // Anchored on the right column ("For the Artist" cell) of the
          // signature table at the end of the contract. Values are percentages
          // of the page size and tuned for the layout produced by
          // `renderEngagementContractHtml` (no page break, signature block
          // lands near the top of the last page).
          page,
          ...SIGNATURE_FIELD_POSITION,
        },
      ],
    }),
  });

  await handleResponse(response, "envelope/field/create-many");
};

export const downloadSignedEnvelope = async (
  baseUrl: string,
  apiKey: string,
  documentId: string,
  minioLocalEndpoint?: string,
): Promise<Buffer> => {
  const docResponse = await fetch(
    `${baseUrl}/api/v1/documents/${encodeURIComponent(documentId)}/download`,
    { headers: authHeader(apiKey) },
  );

  if (!docResponse.ok) {
    const body = await docResponse.text().catch(() => "");
    throw new Error(
      `Documenso download error (${docResponse.status}): ${body}`,
    );
  }

  const { downloadUrl } = (await docResponse.json()) as { downloadUrl: string };

  if (!minioLocalEndpoint) {
    const pdfResponse = await fetch(downloadUrl);
    if (!pdfResponse.ok)
      throw new Error(`S3 download error (${pdfResponse.status})`);
    return Buffer.from(await pdfResponse.arrayBuffer());
  }

  // Local dev: TCP connect to minioLocalEndpoint but send the original Host
  // header so MinIO's presigned-URL signature (which includes the host) stays
  // valid.
  return new Promise((resolve, reject) => {
    const original = new NodeURL(downloadUrl);
    const local = new NodeURL(minioLocalEndpoint);

    const req = http.request(
      {
        hostname: local.hostname,
        port: Number(local.port) || 80,
        path: original.pathname + original.search,
        method: "GET",
        headers: { host: original.host },
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on("data", (chunk: Buffer) => chunks.push(chunk));
        res.on("end", () => {
          const buf = Buffer.concat(chunks);
          if ((res.statusCode ?? 0) >= 400) {
            reject(new Error(`S3 download error (${res.statusCode})`));
          } else {
            resolve(buf);
          }
        });
        res.on("error", reject);
      },
    );
    req.on("error", reject);
    req.end();
  });
};

export const extractSigningUrl = (
  envelope: DocumensoEnvelope,
  baseUrl?: string,
): string | null => {
  // The signing URL belongs to the signer — never the CC recipient.
  const recipient =
    envelope.recipients?.find(
      (item) => item.role === DOCUMENSO_RECIPIENT_ROLE.SIGNER,
    ) ?? envelope.recipients?.[0];
  if (!recipient) return null;
  if (recipient.signingUrl) return recipient.signingUrl;
  if (baseUrl && recipient.token) return `${baseUrl}/sign/${recipient.token}`;
  return null;
};

const normalizeEnvelope = (
  payload: Record<string, unknown>,
): DocumensoEnvelope | null => {
  if (typeof payload.id !== "number" && typeof payload.id !== "string") {
    return null;
  }

  const recipients = Array.isArray(payload.recipients)
    ? (payload.recipients as DocumensoRecipient[])
    : [];

  return {
    id: String(payload.id),
    title: String(payload.title ?? ""),
    status: String(payload.status ?? ""),
    recipients,
  };
};
