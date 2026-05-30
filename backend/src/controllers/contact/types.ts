export interface SendContactMessageBody {
  name: string;
  email: string;
  subject: string;
  message: string;
  website?: string;
}

export interface SendContactMessageResponse {
  message: string;
  delivered: boolean;
}
