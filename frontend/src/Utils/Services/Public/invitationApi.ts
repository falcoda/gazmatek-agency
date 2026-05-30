import {
  buildArtistInvitationAcceptUrl,
  buildArtistInvitationUrl,
} from "@/config/apiRoutes";
import { publicFetch } from "@/Utils/Services/Public/publicFetch";

export interface ArtistInvitationMeta {
  email: string;
  stage_name: string;
  level: string;
  set_type: string;
}

export interface InvitationAcceptResult {
  token: string;
  refreshToken: string;
  artist: { id: string; email: string; slug: string; stageName: string };
}

export async function fetchArtistInvitation(
  token: string,
): Promise<ArtistInvitationMeta | null> {
  return publicFetch(buildArtistInvitationUrl(token), {
    silent: true,
  });
}

export async function acceptArtistInvitation(
  token: string,
  payload: {
    password: string;
    cguAccepted: boolean;
    privacyAccepted: boolean;
  },
): Promise<InvitationAcceptResult | null> {
  return publicFetch(buildArtistInvitationAcceptUrl(token), {
    method: "POST",
    body: JSON.stringify(payload),
    silent: true,
  });
}
