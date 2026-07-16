import { API_ROUTES } from "@/config/apiRoutes";
import type { AppLanguage } from "@/i18n/config";
import { publicFetch } from "@/Utils/Services/Public/publicFetch";

export interface ContactMessagePayload {
  name: string;
  email: string;
  subject: string;
  message: string;
  /** Language the acknowledgement email is sent in. */
  locale: AppLanguage;
  website?: string;
}

export interface ContactMessageResponse {
  message: string;
  delivered: boolean;
}

export async function postContactMessage(
  payload: ContactMessagePayload,
): Promise<ContactMessageResponse | null> {
  return publicFetch<ContactMessageResponse>(API_ROUTES.contact, {
    method: "POST",
    body: JSON.stringify({ ...payload, website: payload.website ?? "" }),
  });
}
