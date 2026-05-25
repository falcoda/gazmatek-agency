export interface NotificationPayload {
  title: string;
  message: string;
  metadata?: unknown;
}

export interface NotificationService {
  notify(payload: NotificationPayload): Promise<void>;
  close(): Promise<void>;
}
