import { BookingController } from "@src/controllers/bookings/bookingController";
import pool from "@src/db/dbConnect";
import { validateRequest } from "@src/helpers/validation";
import { requireClient } from "@src/middleware/auth/requireKind";
import { createBookingBodySchema } from "@src/schemas/booking";
import BookingService from "@src/services/bookings/bookingService";
import { Router } from "express";

const bookingRouter = Router();
const controller = new BookingController(new BookingService(pool));

/**
 * @swagger
 * /api/booking:
 *   post:
 *     summary: Create a booking request (authenticated client)
 *     tags:
 *       - Booking
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [eventDate, durationHours, location, capacity, ticketPriceCents, setType]
 *             properties:
 *               artistId:
 *                 type: string
 *                 format: uuid
 *                 description: Artist id. Either artistId or artistSlug is required.
 *               artistSlug:
 *                 type: string
 *                 description: Artist slug. Either artistId or artistSlug is required.
 *               eventDate:
 *                 type: string
 *                 format: date-time
 *               durationHours:
 *                 type: number
 *                 minimum: 0.5
 *                 maximum: 24
 *               location:
 *                 type: object
 *                 required: [address]
 *                 properties:
 *                   address: { type: string }
 *                   lat: { type: number }
 *                   lng: { type: number }
 *               context: { type: string }
 *               capacity: { type: integer, minimum: 0 }
 *               ticketPriceCents: { type: integer, minimum: 0 }
 *               setType:
 *                 type: string
 *                 enum: [dj, hybrid, live]
 *               options:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [id]
 *                   properties:
 *                     id: { type: string }
 *                     label: { type: string }
 *                     priceCents: { type: integer, minimum: 0 }
 *               locale:
 *                 type: string
 *                 enum: [fr, nl, en]
 *     responses:
 *       201:
 *         description: Booking request created.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id: { type: string }
 *                 status: { type: string }
 *                 clientEmail: { type: string }
 *       400:
 *         description: Validation error.
 *       401:
 *         description: Authentication required.
 *       404:
 *         description: Artist not found.
 *       409:
 *         description: Artist is not available at the requested time.
 */
bookingRouter.post(
  "/",
  requireClient,
  validateRequest({ body: createBookingBodySchema }),
  controller.create,
);

export default bookingRouter;
