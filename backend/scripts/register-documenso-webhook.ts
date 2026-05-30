/**
 * Prints the exact values to configure in the Documenso UI:
 *   Settings → Webhooks → Create webhook
 *
 * Run: npm run documenso:register-webhook
 *
 * Required env vars: DOCUMENSO_URL, DOCUMENSO_WEBHOOK_SECRET, APP_BASE_URL
 */

import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const DOCUMENSO_URL = process.env.DOCUMENSO_URL?.replace(/\/$/, "");
const DOCUMENSO_WEBHOOK_SECRET = process.env.DOCUMENSO_WEBHOOK_SECRET;
const APP_BASE_URL = process.env.APP_BASE_URL?.replace(/\/$/, "");

const missing = (
  [
    ["DOCUMENSO_URL", DOCUMENSO_URL],
    ["DOCUMENSO_WEBHOOK_SECRET", DOCUMENSO_WEBHOOK_SECRET],
    ["APP_BASE_URL", APP_BASE_URL],
  ] as [string, string | undefined][]
)
  .filter(([, v]) => !v)
  .map(([k]) => k);

if (missing.length > 0) {
  console.error(
    `\nMissing required environment variables: ${missing.join(", ")}\n`,
  );
  process.exit(1);
}

const settingsUrl = `${DOCUMENSO_URL}/settings/webhooks`;

const isLocalhost = (() => {
  try {
    const { hostname } = new URL(APP_BASE_URL!);
    return hostname === "localhost" || hostname === "127.0.0.1";
  } catch {
    return false;
  }
})();

// In local dev the backend runs on the host while Documenso runs in Docker.
// `localhost` inside the Documenso container would point to the container
// itself, so the webhook must use `host.docker.internal` to cross the bridge.
const webhookUrl = isLocalhost
  ? `${APP_BASE_URL!.replace(/localhost|127\.0\.0\.1/, "host.docker.internal")}/api/webhooks/documenso`
  : `${APP_BASE_URL}/api/webhooks/documenso`;

console.log(`
╔══════════════════════════════════════════════════════════════╗
║           Documenso — Webhook configuration                  ║
╚══════════════════════════════════════════════════════════════╝

Ouvre cette URL dans ton navigateur :
  ${settingsUrl}

Clique sur "Create webhook" et remplis le formulaire :

  Webhook URL   →  ${webhookUrl}
  Events        →  DOCUMENT_COMPLETED
  Secret        →  ${DOCUMENSO_WEBHOOK_SECRET}
  Enabled       →  ✓
${
  isLocalhost
    ? `
ℹ  Dev local : l'URL utilise host.docker.internal pour que Documenso
   (dans Docker) puisse joindre ton backend (sur l'hôte). Si Documenso
   refuse l'URL pour cause de SSRF, set NEXT_PRIVATE_INTERNAL_WEBAPP_URL
   ou utilise un tunnel public (ex. ngrok) puis colle l'URL ngrok ici.
`
    : ""
}
`);
