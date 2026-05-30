import {
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  type SupportedLocale,
} from "@src/helpers/constants/domain";
import { HTTP_STATUS } from "@src/helpers/error/constants";
import { UnauthorizedError } from "@src/helpers/error/errors";
import type { CreateBookingBody } from "@src/schemas/booking";
import BookingService from "@src/services/bookings/bookingService";
import { NextFunction, Request, Response } from "express";

const isSupportedLocale = (value: string): value is SupportedLocale =>
  (SUPPORTED_LOCALES as readonly string[]).includes(value);

export class BookingController {
  constructor(private bookingService: BookingService) {}

  create = async (
    req: Request<Record<string, never>, unknown, CreateBookingBody>,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const body = req.body;
      const localeHeader = (req.headers["accept-language"] ?? "").split(",")[0];
      const locale: SupportedLocale =
        body.locale ??
        (isSupportedLocale(localeHeader) ? localeHeader : DEFAULT_LOCALE);

      const clientId = req.identity?.sub;
      if (!clientId) {
        throw new UnauthorizedError();
      }
      const account = await this.bookingService.resolveClientAccount(clientId);

      const result = await this.bookingService.create({
        artistId: body.artistId,
        artistSlug: body.artistSlug,
        eventDate: body.eventDate,
        durationHours: body.durationHours,
        location: body.location,
        context: body.context,
        capacity: body.capacity,
        ticketPriceCents: body.ticketPriceCents,
        setType: body.setType,
        options: body.options,
        client: {
          email: account.clientEmail,
          name: account.clientName,
          phone: undefined,
        },
        clientAccountId: account.clientId,
        locale,
      });

      res.status(HTTP_STATUS.CREATED).json({
        id: result.id,
        status: result.status,
        clientEmail: result.clientEmail,
      });
    } catch (error) {
      next(error);
    }
  };
}

export default BookingController;
