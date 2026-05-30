import { lazy } from "react";

export const Home = lazy(() => import("../../pages/Home/Home"));
export const Artists = lazy(() => import("../../pages/Artists/Artists"));
export const ArtistDetail = lazy(
  () => import("../../pages/ArtistDetail/ArtistDetail"),
);
export const Pricing = lazy(() => import("../../pages/Pricing/Pricing"));
export const Contact = lazy(() => import("../../pages/Contact/Contact"));
export const BookingNew = lazy(
  () => import("../../pages/BookingNew/BookingNew"),
);
export const BookingSent = lazy(
  () => import("../../pages/BookingSent/BookingSent"),
);
export const ArtistLogin = lazy(
  () => import("../../pages/ArtistLogin/ArtistLogin"),
);
export const ArtistBookings = lazy(
  () => import("../../pages/ArtistBookings/ArtistBookings"),
);
export const ArtistBookingDetail = lazy(
  () => import("../../pages/ArtistBookingDetail/ArtistBookingDetail"),
);
export const ArtistCalendar = lazy(
  () => import("../../pages/ArtistCalendar/ArtistCalendar"),
);
export const AdminLogin = lazy(
  () => import("../../pages/AdminLogin/AdminLogin"),
);
export const AdminArtists = lazy(
  () => import("../../pages/AdminArtists/AdminArtists"),
);
export const AdminArtistEdit = lazy(
  () => import("../../pages/AdminArtistEdit/AdminArtistEdit"),
);
export const AdminBookings = lazy(
  () => import("../../pages/AdminBookings/AdminBookings"),
);
export const AdminBookingNew = lazy(
  () => import("../../pages/AdminBookingNew/AdminBookingNew"),
);
export const AdminBookingDetail = lazy(
  () => import("../../pages/AdminBookingDetail/AdminBookingDetail"),
);
export const AdminContent = lazy(
  () => import("../../pages/AdminContent/AdminContent"),
);
export const AdminSettings = lazy(
  () => import("../../pages/AdminSettings/AdminSettings"),
);
export const AccountLogin = lazy(
  () => import("../../pages/AccountLogin/AccountLogin"),
);
export const AccountSignup = lazy(
  () => import("../../pages/AccountSignup/AccountSignup"),
);
export const AccountForgotPassword = lazy(
  () => import("../../pages/AccountForgotPassword/AccountForgotPassword"),
);
export const AccountResetPassword = lazy(
  () => import("../../pages/AccountResetPassword/AccountResetPassword"),
);
export const AccountClaim = lazy(
  () => import("../../pages/AccountClaim/AccountClaim"),
);
export const AccountDashboard = lazy(
  () => import("../../pages/AccountDashboard/AccountDashboard"),
);
export const ArtistProfile = lazy(
  () => import("../../pages/ArtistProfile/ArtistProfile"),
);
export const ArtistInvitationLanding = lazy(
  () => import("../../pages/ArtistInvitationLanding/ArtistInvitationLanding"),
);
export const ArtistOnboardingContract = lazy(
  () => import("../../pages/ArtistOnboardingContract/ArtistOnboardingContract"),
);
export const TermsOfUses = lazy(
  () => import("../../pages/TermsOfUses/TermsOfUses"),
);
export const PrivacyPolicy = lazy(
  () => import("../../pages/PrivacyPolicy/PrivacyPolicy"),
);
export const NotFound = lazy(() => import("../../pages/NotFound/NotFound"));
