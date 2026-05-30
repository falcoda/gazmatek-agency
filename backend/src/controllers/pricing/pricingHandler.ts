import {
  ArtistFeeRequestBody,
  ArtistFeeResponse,
  EstimateRequestBody,
  EstimateResponse,
  GridResponse,
} from "@src/controllers/pricing/types";
import { HTTP_STATUS } from "@src/helpers/error/constants";
import { logger } from "@src/helpers/logger";
import { ArtistFeeInput } from "@src/services/pricing/artistFeeService";
import PricingService from "@src/services/pricing/pricingService";
import { NextFunction, Request, Response } from "express";

export class PricingHandler {
  constructor(private pricingService: PricingService) {}

  estimate = async (
    req: Request<Record<string, never>, unknown, EstimateRequestBody>,
    res: Response<EstimateResponse>,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const breakdown = await this.pricingService.estimate({
        artistId: req.body.artistId,
        durationHours: req.body.durationHours,
        date: req.body.date,
        location: req.body.location,
        capacity: req.body.capacity,
        ticketPriceCents: req.body.ticketPriceCents,
        setType: req.body.setType,
        options: req.body.options,
      });

      logger.info("Pricing estimate computed", {
        artistId: req.body.artistId,
        totalCents: breakdown.totalCents,
      });

      res.status(HTTP_STATUS.OK).json(breakdown);
    } catch (error) {
      next(error);
    }
  };

  artistFee = (
    req: Request<Record<string, never>, unknown, ArtistFeeRequestBody>,
    res: Response<ArtistFeeResponse>,
    next: NextFunction,
  ): void => {
    try {
      const input: ArtistFeeInput = {
        capacity: req.body.capacity,
        ticketPrice: req.body.ticketPrice,
        level: req.body.level,
        setType: req.body.setType,
      };
      const result = this.pricingService.computeArtistFee(input);
      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  grid = (
    _req: Request,
    res: Response<GridResponse>,
    next: NextFunction,
  ): void => {
    try {
      const grid = this.pricingService.getGrid();
      res.status(HTTP_STATUS.OK).json(grid);
    } catch (error) {
      next(error);
    }
  };
}

export default PricingHandler;
