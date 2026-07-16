import { config } from "@src/helpers/config";
import { buildFromHeader } from "@src/services/mailer/fromHeader";
import { MailerService, MailPayload } from "@src/services/mailer/types";
import nodemailer from "nodemailer";

export class SmtpMailerService implements MailerService {
  private transporter = nodemailer.createTransport({
    host: config.mailer.smtp.host,
    port: config.mailer.smtp.port,
    secure: config.mailer.smtp.secure,
    auth:
      config.mailer.smtp.user && config.mailer.smtp.password
        ? {
            user: config.mailer.smtp.user,
            pass: config.mailer.smtp.password,
          }
        : undefined,
  });

  async send(payload: MailPayload): Promise<void> {
    await this.transporter.sendMail({
      from: buildFromHeader(),
      to: payload.to,
      subject: payload.subject,
      text: payload.text,
      html: payload.html,
    });
  }

  async close(): Promise<void> {
    this.transporter.close();
  }
}
