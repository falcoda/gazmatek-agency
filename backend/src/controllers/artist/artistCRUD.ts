import {
  ArtistDetailDto,
  ArtistListResponse,
} from "@src/controllers/artist/types";
import { HTTP_STATUS } from "@src/helpers/error/constants";
import type {
  GetArtistBySlugParams,
  GetArtistBySlugQuery,
  ListArtistsQuery,
} from "@src/schemas/artist";
import ArtistService from "@src/services/artist/artistService";
import { NextFunction, Request, Response } from "express";

export class ArtistCRUD {
  constructor(private artistService: ArtistService) {}

  list = async (
    req: Request<Record<string, never>, unknown, never>,
    res: Response<ArtistListResponse>,
    next: NextFunction,
  ): Promise<void> => {
    try {
      // validateRequest replaced req.query with the parsed shape.
      const query = req.query as unknown as ListArtistsQuery;
      const effectivePageSize = query.limit ?? query.page_size;

      const result = await this.artistService.listPublic({
        featured: query.featured,
        genre: query.genre,
        page: query.page,
        pageSize: effectivePageSize,
        lang: query.lang,
      });

      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  getBySlug = async (
    req: Request<GetArtistBySlugParams>,
    res: Response<ArtistDetailDto>,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const query = req.query as unknown as GetArtistBySlugQuery;
      const artist = await this.artistService.getBySlug(
        req.params.slug,
        query.lang,
      );
      res.status(HTTP_STATUS.OK).json(artist);
    } catch (error) {
      next(error);
    }
  };
}

export default ArtistCRUD;
