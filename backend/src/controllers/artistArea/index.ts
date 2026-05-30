import ArtistAreaService from "@src/services/artistArea/artistAreaService";
import BookingService from "@src/services/bookings/bookingService";
import UnavailabilityService from "@src/services/unavailability/unavailabilityService";
import { Pool } from "pg";

import ArtistAreaCRUD from "./artistAreaCRUD";

// Domain assembler: builds the services and injects them into the CRUD handlers.
class ArtistAreaController {
  me: ArtistAreaCRUD["me"];
  getProfile: ArtistAreaCRUD["getProfile"];
  updateProfile: ArtistAreaCRUD["updateProfile"];
  uploadCoverImage: ArtistAreaCRUD["uploadCoverImage"];
  changePassword: ArtistAreaCRUD["changePassword"];
  listBookings: ArtistAreaCRUD["listBookings"];
  getBookingDetail: ArtistAreaCRUD["getBookingDetail"];
  getBookingContract: ArtistAreaCRUD["getBookingContract"];
  signBookingContract: ArtistAreaCRUD["signBookingContract"];
  getEngagementContract: ArtistAreaCRUD["getEngagementContract"];
  signEngagementContract: ArtistAreaCRUD["signEngagementContract"];
  listUnavailabilities: ArtistAreaCRUD["listUnavailabilities"];
  createUnavailability: ArtistAreaCRUD["createUnavailability"];
  deleteUnavailability: ArtistAreaCRUD["deleteUnavailability"];

  constructor(db: Pool) {
    const bookingService = new BookingService(db);
    const unavailabilityService = new UnavailabilityService(db);
    const artistAreaService = new ArtistAreaService(db, bookingService);
    const crud = new ArtistAreaCRUD(artistAreaService, unavailabilityService);

    this.me = crud.me;
    this.getProfile = crud.getProfile;
    this.updateProfile = crud.updateProfile;
    this.uploadCoverImage = crud.uploadCoverImage;
    this.changePassword = crud.changePassword;
    this.listBookings = crud.listBookings;
    this.getBookingDetail = crud.getBookingDetail;
    this.getBookingContract = crud.getBookingContract;
    this.signBookingContract = crud.signBookingContract;
    this.getEngagementContract = crud.getEngagementContract;
    this.signEngagementContract = crud.signEngagementContract;
    this.listUnavailabilities = crud.listUnavailabilities;
    this.createUnavailability = crud.createUnavailability;
    this.deleteUnavailability = crud.deleteUnavailability;
  }
}

export default ArtistAreaController;
