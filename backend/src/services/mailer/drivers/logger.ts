import { logger } from "@src/helpers/logger";
import { buildFromHeader } from "@src/services/mailer/fromHeader";
import { MailerService, MailPayload } from "@src/services/mailer/types";

const SEPARATOR = "=".repeat(60);

export class LoggerMailerService implements MailerService {
  async send(payload: MailPayload): Promise<void> {
    const lines: string[] = [
      "",
      SEPARATOR,
      "FAKE EMAIL (dev mode — not actually sent)",
      SEPARATOR,
      `From:    ${buildFromHeader()}`,
      `To:      ${payload.to}`,
      `Subject: ${payload.subject}`,
      SEPARATOR,
      payload.text ||
        (payload.html ? `[HTML body]\n${payload.html}` : "[empty body]"),
      SEPARATOR,
    ];

    logger.info(lines.join("\n"));
  }

  async close(): Promise<void> {
    return;
  }
}
