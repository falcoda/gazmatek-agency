import { AUDIT_ACTOR_KIND } from "@src/helpers/constants/domain";
import { HTTP_STATUS } from "@src/helpers/error/constants";
import {
  ForbiddenError,
  UnauthorizedError,
  ValidationError,
} from "@src/helpers/error/errors";
import type {
  ChangeArtistPasswordBody,
  ListArtistBookingsQuery,
  ListArtistUnavailabilitiesQuery,
  UpdateArtistProfileBody,
} from "@src/schemas/artistArea";
import ArtistAreaService from "@src/services/artistArea/artistAreaService";
import UnavailabilityService from "@src/services/unavailability/unavailabilityService";
import { NextFunction, Request, Response } from "express";

import { ArtistMeResponse } from "./types";

const DEFAULT_AVAILABILITY_WINDOW_MS = 365 * 24 * 60 * 60 * 1000;

export class ArtistAreaCRUD {
  constructor(
    private artistAreaService: ArtistAreaService,
    private unavailabilityService: UnavailabilityService,
  ) {}

  me = (req: Request, res: Response<ArtistMeResponse>, next: NextFunction) => {
    try {
      // requireArtist guarantees an artist identity is present; this is a
      // defensive guard only (kind is intentionally not re-checked here, see
      // the narrowed augmentation in middleware/auth/requireKind.ts).
      if (!req.identity) {
        throw new UnauthorizedError();
      }
      res.status(HTTP_STATUS.OK).json({
        id: req.identity.sub,
        email: req.identity.data,
        stageName: req.identity.displayName ?? null,
      });
    } catch (error) {
      next(error);
    }
  };

  getProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const artistId = this.requireArtistId(req);
      const profile = await this.artistAreaService.getProfile(artistId);
      res.status(HTTP_STATUS.OK).json(profile);
    } catch (error) {
      next(error);
    }
  };

  updateProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const artistId = this.requireArtistId(req);
      const updated = await this.artistAreaService.updateProfile(
        artistId,
        req.body as UpdateArtistProfileBody,
      );
      res.status(HTTP_STATUS.OK).json(updated);
    } catch (error) {
      next(error);
    }
  };

  uploadCoverImage = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const artistId = this.requireArtistId(req);
      const file = (req as unknown as { file?: Express.Multer.File }).file;
      if (!file) throw new ValidationError("Missing file");
      const result = await this.artistAreaService.uploadCoverImage(artistId, {
        buffer: file.buffer,
        mimetype: file.mimetype,
        size: file.size,
      });
      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  changePassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const artistId = this.requireArtistId(req);
      await this.artistAreaService.changePassword(
        artistId,
        req.body as ChangeArtistPasswordBody,
      );
      res.status(HTTP_STATUS.NO_CONTENT).end();
    } catch (error) {
      next(error);
    }
  };

  listBookings = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const artistId = this.requireArtistId(req);
      const result = await this.artistAreaService.listBookings(
        artistId,
        req.query as unknown as ListArtistBookingsQuery,
      );
      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  getBookingDetail = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const artistId = this.requireArtistId(req);
      const result = await this.artistAreaService.getBookingDetail(
        artistId,
        req.params.id as string,
      );
      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  getBookingContract = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const artistId = this.requireArtistId(req);
      const result = await this.artistAreaService.getBookingContract(
        artistId,
        req.params.id as string,
      );
      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  signBookingContract = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const artistId = this.requireArtistId(req);
      const result = await this.artistAreaService.signBookingContract(
        artistId,
        req.params.id as string,
      );
      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  getEngagementContract = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const artistId = this.requireArtistId(req);
      const result =
        await this.artistAreaService.getOrCreateEngagementContract(artistId);
      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  signEngagementContract = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      if (!req.identity) throw new ForbiddenError("Missing identity");
      const result = await this.artistAreaService.signEngagementContract(
        req.identity.sub,
        req.identity.data,
      );
      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  listUnavailabilities = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const artistId = this.requireArtistId(req);
      const query = req.query as unknown as ListArtistUnavailabilitiesQuery;
      const from = query.from ? new Date(query.from) : new Date();
      const to = query.to
        ? new Date(query.to)
        : new Date(Date.now() + DEFAULT_AVAILABILITY_WINDOW_MS);
      const rows = await this.unavailabilityService.listForArtist(
        artistId,
        from,
        to,
      );
      res.status(HTTP_STATUS.OK).json({ data: rows });
    } catch (error) {
      next(error);
    }
  };

  createUnavailability = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const artistId = this.requireArtistId(req);
      const created = await this.unavailabilityService.create({
        artistId,
        actorKind: AUDIT_ACTOR_KIND.ARTIST,
        actorId: artistId,
        input: req.body,
      });
      res.status(HTTP_STATUS.CREATED).json(created);
    } catch (error) {
      next(error);
    }
  };

  deleteUnavailability = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const artistId = this.requireArtistId(req);
      await this.unavailabilityService.deleteForArtist({
        unavailabilityId: req.params.id as string,
        artistId,
        enforceArtistOwnership: true,
      });
      res.status(HTTP_STATUS.NO_CONTENT).send();
    } catch (error) {
      next(error);
    }
  };

  private requireArtistId(req: Request): string {
    if (!req.identity) throw new ForbiddenError("Missing identity");
    return req.identity.sub;
  }
}

export default ArtistAreaCRUD;
