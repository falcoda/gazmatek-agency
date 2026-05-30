import { API_ROUTES } from "@/config/apiRoutes";
import { publicFetch } from "@/Utils/Services/Public/publicFetch";

export interface ContactMessagePayload {
  name: string;
  email: string;
  subject: string;
  message: string;
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
