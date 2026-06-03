import { config } from "@src/helpers/config";
import { NODE_ENV } from "@src/helpers/constants";
import { logger } from "@src/helpers/logger";
import { GuardedMailerService } from "@src/services/mailer/drivers/guarded";
import { LoggerMailerService } from "@src/services/mailer/drivers/logger";
import { SmtpMailerService } from "@src/services/mailer/drivers/smtp";
import { MailerService } from "@src/services/mailer/types";
import { MAIL_DRIVER } from "@src/types/config";

let mailerService: MailerService | null = null;

export const getMailerService = (): MailerService => {
  if (mailerService) {
    return mailerService;
  }

  if (!config.mailer.enabled || config.mailer.driver === MAIL_DRIVER.DISABLED) {
    mailerService = new LoggerMailerService();
    return mailerService;
  }

  // In development, never send real emails: always log them to the console
  // so fake emails are visible regardless of MAILER_DRIVER. Real SMTP delivery
  // is reserved for non-development environments.
  if (config.nodeEnv === NODE_ENV.DEVELOPMENT) {
    logger.info(
      "Mailer running in development mode: forcing logger driver (no real emails will be sent)",
    );
    mailerService = new LoggerMailerService();
    return mailerService;
  }

  if (config.mailer.driver === MAIL_DRIVER.SMTP) {
    // Guard real delivery: reserved-domain recipients (example.com, *.test, …)
    // always bounce and would get the sender blacklisted, so they are skipped.
    mailerService = new GuardedMailerService(new SmtpMailerService());
    return mailerService;
  }

  mailerService = new LoggerMailerService();
  return mailerService;
};

export const closeMailerService = async (): Promise<void> => {
  if (!mailerService) {
    return;
  }

  await mailerService.close();
  mailerService = null;
};
