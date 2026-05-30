import { HomeStatsResponse } from "@src/controllers/stats/types";
import { PUBLIC_CACHE_CONTROL } from "@src/helpers/constants/http";
import { HTTP_STATUS } from "@src/helpers/error/constants";
import StatsService from "@src/services/stats/statsService";
import { NextFunction, Request, Response } from "express";

export class StatsHandler {
  constructor(private statsService: StatsService) {}

  home = async (
    _req: Request,
    res: Response<HomeStatsResponse>,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const stats = await this.statsService.getHomeStats();
      res.set("Cache-Control", PUBLIC_CACHE_CONTROL);
      res.status(HTTP_STATUS.OK).json(stats);
    } catch (error) {
      next(error);
    }
  };
}

export default StatsHandler;
