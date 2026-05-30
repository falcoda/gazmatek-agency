import { Navigate, Route, Routes } from "react-router-dom";

import ProtectedKindRoute from "../../components/ProtectedKindRoute/ProtectedKindRoute";
import { PAGES } from "../../config/pages";
import AdminLayout from "../../layouts/AdminLayout/AdminLayout";
import ArtistLayout from "../../layouts/ArtistLayout/ArtistLayout";
import PublicLayout from "../../layouts/PublicLayout/PublicLayout";
import {
  AccountClaim,
  AccountDashboard,
  AccountForgotPassword,
  AccountLogin,
  AccountResetPassword,
  AccountSignup,
  AdminArtistEdit,
  AdminArtists,
  AdminBookingDetail,
  AdminBookingNew,
  AdminBookings,
  AdminContent,
  AdminLogin,
  AdminSettings,
  ArtistBookingDetail,
  ArtistBookings,
  ArtistCalendar,
  ArtistDetail,
  ArtistInvitationLanding,
  ArtistLogin,
  ArtistOnboardingContract,
  ArtistProfile,
  Artists,
  BookingNew,
  BookingSent,
  Contact,
  Home,
  NotFound,
  Pricing,
  PrivacyPolicy,
  TermsOfUses,
} from "./lazyPages";

function MonoRouter() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path={PAGES.main} element={<Home />} />
        <Route path={PAGES.artists} element={<Artists />} />
        <Route path={PAGES.artistDetail} element={<ArtistDetail />} />
        <Route path={PAGES.pricing} element={<Pricing />} />
        <Route path={PAGES.contact} element={<Contact />} />
        <Route path={PAGES.terms} element={<TermsOfUses />} />
        <Route path={PAGES.privacy} element={<PrivacyPolicy />} />
        <Route path={PAGES.bookingNew} element={<BookingNew />} />
        <Route path={PAGES.bookingSent} element={<BookingSent />} />
        <Route path={PAGES.artistLogin} element={<ArtistLogin />} />
        <Route path={PAGES.adminLogin} element={<AdminLogin />} />
        <Route path={PAGES.accountLogin} element={<AccountLogin />} />
        <Route path={PAGES.accountSignup} element={<AccountSignup />} />
        <Route
          path={PAGES.accountForgotPassword}
          element={<AccountForgotPassword />}
        />
        <Route
          path={PAGES.accountResetPassword}
          element={<AccountResetPassword />}
        />
        <Route path={PAGES.accountClaim} element={<AccountClaim />} />
        <Route
          path={PAGES.artistInvitation}
          element={<ArtistInvitationLanding />}
        />
        <Route path="*" element={<NotFound />} />
      </Route>

      <Route element={<PublicLayout />}>
        <Route
          path={PAGES.accountDashboard}
          element={
            <ProtectedKindRoute kind="client">
              <AccountDashboard />
            </ProtectedKindRoute>
          }
        />
        <Route
          path="/account/bookings"
          element={<Navigate to={PAGES.accountDashboard} replace />}
        />
      </Route>

      <Route element={<ArtistLayout />}>
        <Route
          path="/artist"
          element={<Navigate to={PAGES.artistBookings} replace />}
        />
        <Route
          path={PAGES.artistBookings}
          element={
            <ProtectedKindRoute kind="artist">
              <ArtistBookings />
            </ProtectedKindRoute>
          }
        />
        <Route
          path={PAGES.artistBookingDetail}
          element={
            <ProtectedKindRoute kind="artist">
              <ArtistBookingDetail />
            </ProtectedKindRoute>
          }
        />
        <Route
          path={PAGES.artistCalendar}
          element={
            <ProtectedKindRoute kind="artist">
              <ArtistCalendar />
            </ProtectedKindRoute>
          }
        />
        <Route
          path={PAGES.artistProfile}
          element={
            <ProtectedKindRoute kind="artist">
              <ArtistProfile />
            </ProtectedKindRoute>
          }
        />
        <Route
          path={PAGES.artistOnboardingContract}
          element={
            <ProtectedKindRoute kind="artist">
              <ArtistOnboardingContract />
            </ProtectedKindRoute>
          }
        />
      </Route>

      <Route element={<AdminLayout />}>
        <Route
          path="/admin"
          element={<Navigate to={PAGES.adminArtists} replace />}
        />
        <Route
          path={PAGES.adminArtists}
          element={
            <ProtectedKindRoute kind="admin">
              <AdminArtists />
            </ProtectedKindRoute>
          }
        />
        <Route
          path={PAGES.adminBookings}
          element={
            <ProtectedKindRoute kind="admin">
              <AdminBookings />
            </ProtectedKindRoute>
          }
        />
        <Route
          path={PAGES.adminArtistEdit}
          element={
            <ProtectedKindRoute kind="admin">
              <AdminArtistEdit />
            </ProtectedKindRoute>
          }
        />
        <Route
          path={PAGES.adminBookingNew}
          element={
            <ProtectedKindRoute kind="admin">
              <AdminBookingNew />
            </ProtectedKindRoute>
          }
        />
        <Route
          path={PAGES.adminBookingDetail}
          element={
            <ProtectedKindRoute kind="admin">
              <AdminBookingDetail />
            </ProtectedKindRoute>
          }
        />
        <Route
          path={PAGES.adminContent}
          element={
            <ProtectedKindRoute kind="admin">
              <AdminContent />
            </ProtectedKindRoute>
          }
        />
        <Route
          path={PAGES.adminSettings}
          element={
            <ProtectedKindRoute kind="admin">
              <AdminSettings />
            </ProtectedKindRoute>
          }
        />
      </Route>
    </Routes>
  );
}

export default MonoRouter;
