export interface MailPayload {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export interface MailerService {
  send(payload: MailPayload): Promise<void>;
  close(): Promise<void>;
}
