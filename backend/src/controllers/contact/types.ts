import { EmailLocale } from "@src/services/mailer/emailConstants";

export interface SendContactMessageBody {
  name: string;
  email: string;
  subject: string;
  message: string;
  locale: EmailLocale;
  website?: string;
}

export interface SendContactMessageResponse {
  message: string;
  delivered: boolean;
}
