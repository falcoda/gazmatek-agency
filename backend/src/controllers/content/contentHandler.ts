import {
  GetPublicContentQuery,
  GetPublicContentResponse,
} from "@src/controllers/content/types";
import { DEFAULT_LOCALE } from "@src/helpers/constants/domain";
import { PUBLIC_CACHE_CONTROL } from "@src/helpers/constants/http";
import { HTTP_STATUS } from "@src/helpers/error/constants";
import ContentService from "@src/services/content/contentService";
import { NextFunction, Request, Response } from "express";

export class ContentHandler {
  constructor(private contentService: ContentService) {}

  list = async (
    req: Request<
      Record<string, never>,
      unknown,
      unknown,
      GetPublicContentQuery
    >,
    res: Response<GetPublicContentResponse>,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const lang = req.query.lang ?? DEFAULT_LOCALE;
      const data = await this.contentService.getPublicBlocks(lang);

      res.set("Cache-Control", PUBLIC_CACHE_CONTROL);
      // #65 — the response body varies by language, so caches must key on it.
      res.vary("Accept-Language");
      res.status(HTTP_STATUS.OK).json({ data });
    } catch (error) {
      next(error);
    }
  };
}

export default ContentHandler;
