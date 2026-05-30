import pool from "@src/db/dbConnect";
import { HTTP_STATUS } from "@src/helpers/error/constants";
import { NotFoundError } from "@src/helpers/error/errors";
import { validateRequest } from "@src/helpers/validation";
import { authRateLimiter } from "@src/middleware/security/rateLimit";
import {
  acceptArtistInvitationBodySchema,
  artistInvitationTokenParamsSchema,
} from "@src/schemas/artistInvitation";
import ArtistInvitationService from "@src/services/artistInvitation/artistInvitationService";
import { Router } from "express";

const artistInvitationsRouter = Router();
artistInvitationsRouter.use(authRateLimiter);

const service = new ArtistInvitationService(pool);

// Public endpoint: returns the invitation metadata so the landing page can
// greet the artist by stage name. Hides expired/consumed/revoked invitations
// behind a 404 so probing the token namespace doesn't leak status info.
artistInvitationsRouter.get(
  "/:token",
  validateRequest({ params: artistInvitationTokenParamsSchema }),
  async (req, res, next) => {
    try {
      const meta = await service.getByToken(req.params.token as string);
      if (!meta) throw new NotFoundError("Invalid or expired invitation");
      res.status(HTTP_STATUS.OK).json(meta);
    } catch (error) {
      next(error);
    }
  },
);

artistInvitationsRouter.post(
  "/:token/accept",
  validateRequest({
    params: artistInvitationTokenParamsSchema,
    body: acceptArtistInvitationBodySchema,
  }),
  async (req, res, next) => {
    try {
      const body = req.body as {
        password: string;
        cguAccepted: boolean;
        privacyAccepted: boolean;
      };
      const result = await service.accept(req.params.token as string, body);
      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      next(error);
    }
  },
);

export default artistInvitationsRouter;
