import ArtistAreaController from "@src/controllers/artistArea";
import pool from "@src/db/dbConnect";
import { validateRequest } from "@src/helpers/validation";
import {
  requireArtist,
  requireOnboardedArtist,
} from "@src/middleware/auth/requireKind";
import {
  artistAreaBookingIdParamsSchema,
  artistAreaContractIdParamsSchema,
  changeArtistPasswordBodySchema,
  listArtistBookingsQuerySchema,
  listArtistUnavailabilitiesQuerySchema,
  updateArtistProfileBodySchema,
} from "@src/schemas/artistArea";
import {
  createUnavailabilityBodySchema,
  unavailabilityIdParamsSchema,
} from "@src/schemas/availability";
import { ARTIST_COVER_IMAGE_LIMITS } from "@src/services/artistArea/artistAreaService";
import { Router } from "express";
import multer from "multer";

const artistAreaRouter = Router();
artistAreaRouter.use(requireArtist);

const controller = new ArtistAreaController(pool);

// File parsing stays at the route boundary; the service validates the mimetype
// and persists the buffer.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: ARTIST_COVER_IMAGE_LIMITS.MAX_BYTES },
});

/**
 * @swagger
 * /api/artist/me:
 *   get:
 *     summary: Current authenticated artist identity
 *     tags: [ArtistArea]
 *     responses:
 *       200: { description: Artist identity }
 *       401: { description: Unauthorized }
 */
artistAreaRouter.get("/me", controller.me);

/**
 * @swagger
 * /api/artist/profile:
 *   get:
 *     summary: Get the authenticated artist self profile
 *     tags: [ArtistArea]
 *     responses:
 *       200: { description: Artist profile }
 *       404: { description: Artist not found }
 *   patch:
 *     summary: Update the authenticated artist self profile (writable fields only)
 *     tags: [ArtistArea]
 *     responses:
 *       200: { description: Updated artist profile }
 *       404: { description: Artist not found }
 */
artistAreaRouter.get("/profile", controller.getProfile);
artistAreaRouter.patch(
  "/profile",
  validateRequest({ body: updateArtistProfileBodySchema }),
  controller.updateProfile,
);

/**
 * @swagger
 * /api/artist/profile/cover-image:
 *   post:
 *     summary: Upload the artist cover image (multipart/form-data, field "file")
 *     tags: [ArtistArea]
 *     responses:
 *       200: { description: Uploaded image url and updated profile }
 */
artistAreaRouter.post(
  "/profile/cover-image",
  upload.single("file"),
  controller.uploadCoverImage,
);

/**
 * @swagger
 * /api/artist/profile/password:
 *   post:
 *     summary: Change the authenticated artist password
 *     tags: [ArtistArea]
 *     responses:
 *       204: { description: Password changed }
 *       403: { description: Current password incorrect }
 */
artistAreaRouter.post(
  "/profile/password",
  validateRequest({ body: changeArtistPasswordBodySchema }),
  controller.changePassword,
);

/**
 * @swagger
 * /api/artist/bookings:
 *   get:
 *     summary: List the authenticated artist bookings
 *     tags: [ArtistArea]
 *     parameters:
 *       - in: query
 *         name: tab
 *         schema: { type: string, enum: [upcoming, past], default: upcoming }
 *       - in: query
 *         name: page
 *         schema: { type: integer, minimum: 1, default: 1 }
 *       - in: query
 *         name: page_size
 *         schema: { type: integer, minimum: 1, maximum: 50, default: 25 }
 *     responses:
 *       200: { description: Paginated bookings }
 */
artistAreaRouter.get(
  "/bookings",
  validateRequest({ query: listArtistBookingsQuerySchema }),
  controller.listBookings,
);

/**
 * @swagger
 * /api/artist/bookings/{id}:
 *   get:
 *     summary: Get a booking owned by the authenticated artist
 *     tags: [ArtistArea]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: Booking detail }
 *       404: { description: Booking not found }
 */
artistAreaRouter.get(
  "/bookings/:id",
  validateRequest({ params: artistAreaBookingIdParamsSchema }),
  controller.getBookingDetail,
);

/**
 * @swagger
 * /api/artist/bookings/{id}/contract:
 *   get:
 *     summary: Get the contract attached to an artist booking
 *     tags: [ArtistArea]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: Contract summary }
 *       404: { description: Booking or contract not found }
 */
artistAreaRouter.get(
  "/bookings/:id/contract",
  validateRequest({ params: artistAreaBookingIdParamsSchema }),
  controller.getBookingContract,
);

/**
 * @swagger
 * /api/artist/contracts/{id}/sign:
 *   post:
 *     summary: Start signing a booking contract
 *     tags: [ArtistArea]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: Signing URL or current status }
 *       404: { description: Contract not found }
 */
artistAreaRouter.post(
  "/contracts/:id/sign",
  validateRequest({ params: artistAreaContractIdParamsSchema }),
  controller.signBookingContract,
);

/**
 * @swagger
 * /api/artist/onboarding/engagement:
 *   get:
 *     summary: Get (or initialize) the artist engagement contract
 *     tags: [ArtistArea]
 *     responses:
 *       200: { description: Engagement contract summary }
 */
artistAreaRouter.get(
  "/onboarding/engagement",
  controller.getEngagementContract,
);

/**
 * @swagger
 * /api/artist/onboarding/engagement/sign:
 *   post:
 *     summary: Produce a Documenso signing URL for the engagement contract
 *     tags: [ArtistArea]
 *     responses:
 *       200: { description: Signing URL or current status }
 *       404: { description: Engagement contract not found }
 */
artistAreaRouter.post(
  "/onboarding/engagement/sign",
  controller.signEngagementContract,
);

/**
 * @swagger
 * /api/artist/contracts/engagement/signed:
 *   get:
 *     summary: Download the signed engagement contract PDF (authenticated artist)
 *     tags: [ArtistArea]
 *     responses:
 *       200: { description: Signed PDF stream }
 *       404: { description: Signed contract not available }
 */
artistAreaRouter.get(
  "/contracts/engagement/signed",
  controller.downloadSignedEngagementContract,
);

/**
 * @swagger
 * /api/artist/unavailabilities:
 *   get:
 *     summary: List the authenticated artist unavailabilities
 *     tags: [ArtistArea]
 *     parameters:
 *       - in: query
 *         name: from
 *         schema: { type: string, format: date-time }
 *       - in: query
 *         name: to
 *         schema: { type: string, format: date-time }
 *     responses:
 *       200: { description: Unavailabilities }
 *   post:
 *     summary: Create an unavailability for the authenticated artist
 *     tags: [ArtistArea]
 *     responses:
 *       201: { description: Created unavailability }
 */
artistAreaRouter.get(
  "/unavailabilities",
  validateRequest({ query: listArtistUnavailabilitiesQuerySchema }),
  controller.listUnavailabilities,
);
// #4 — writing availability is a sensitive mutation: gate it behind a completed
// engagement contract. Reading stays open.
artistAreaRouter.post(
  "/unavailabilities",
  requireOnboardedArtist,
  validateRequest({ body: createUnavailabilityBodySchema }),
  controller.createUnavailability,
);

/**
 * @swagger
 * /api/artist/unavailabilities/{id}:
 *   delete:
 *     summary: Delete an unavailability owned by the authenticated artist
 *     tags: [ArtistArea]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       204: { description: Deleted }
 */
artistAreaRouter.delete(
  "/unavailabilities/:id",
  requireOnboardedArtist,
  validateRequest({ params: unavailabilityIdParamsSchema }),
  controller.deleteUnavailability,
);

export default artistAreaRouter;
