import { useEffect } from "react";
import {
  Navigate,
  Route,
  Routes,
  useNavigate,
  useParams,
} from "react-router-dom";

import ProtectedKindRoute from "../../components/ProtectedKindRoute/ProtectedKindRoute";
import { getPagePath, PAGES } from "../../config/pages";
import type { AppLanguage } from "../../i18n/config";
import {
  detectPreferredLanguage,
  isSupportedLanguage,
} from "../../i18n/routing";
import useSyncLanguage from "../../i18n/useSyncLanguage";
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

function LangRedirect() {
  const language = detectPreferredLanguage();
  return <Navigate to={getPagePath("main", language)} replace />;
}

function LocalizedApp() {
  const { lang } = useParams<{ lang: string }>();
  const navigate = useNavigate();
  const currentLanguage: AppLanguage | null = isSupportedLanguage(lang)
    ? lang
    : null;
  useSyncLanguage(currentLanguage);

  useEffect(() => {
    if (!currentLanguage) {
      navigate(PAGES.main, { replace: true });
    }
  }, [currentLanguage, navigate]);

  if (!currentLanguage) {
    return null;
  }

  return (
    <Routes>
      <Route element={<PublicLayout forceLangSwitcher />}>
        <Route index element={<Home />} />
        <Route path="artists" element={<Artists />} />
        <Route path="artists/:slug" element={<ArtistDetail />} />
        <Route path="pricing" element={<Pricing />} />
        <Route path="contact" element={<Contact />} />
        <Route path="terms" element={<TermsOfUses />} />
        <Route path="privacy" element={<PrivacyPolicy />} />
        <Route path="booking/new" element={<BookingNew />} />
        <Route path="booking/sent" element={<BookingSent />} />
        <Route path="artist/login" element={<ArtistLogin />} />
        <Route path="admin/login" element={<AdminLogin />} />
        <Route path="account/login" element={<AccountLogin />} />
        <Route path="account/signup" element={<AccountSignup />} />
        <Route
          path="account/forgot-password"
          element={<AccountForgotPassword />}
        />
        <Route
          path="account/reset-password"
          element={<AccountResetPassword />}
        />
        <Route path="account/claim" element={<AccountClaim />} />
        <Route
          path="account"
          element={
            <ProtectedKindRoute kind="client">
              <AccountDashboard />
            </ProtectedKindRoute>
          }
        />
        <Route
          path="account/bookings"
          element={<Navigate to="../account" replace />}
        />
        <Route path="artist/invitation" element={<ArtistInvitationLanding />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      <Route element={<ArtistLayout />}>
        <Route path="artist" element={<Navigate to="bookings" replace />} />
        <Route
          path="artist/bookings"
          element={
            <ProtectedKindRoute kind="artist">
              <ArtistBookings />
            </ProtectedKindRoute>
          }
        />
        <Route
          path="artist/bookings/:id"
          element={
            <ProtectedKindRoute kind="artist">
              <ArtistBookingDetail />
            </ProtectedKindRoute>
          }
        />
        <Route
          path="artist/calendar"
          element={
            <ProtectedKindRoute kind="artist">
              <ArtistCalendar />
            </ProtectedKindRoute>
          }
        />
        <Route
          path="artist/profile"
          element={
            <ProtectedKindRoute kind="artist">
              <ArtistProfile />
            </ProtectedKindRoute>
          }
        />
        <Route
          path="artist/onboarding/contract"
          element={
            <ProtectedKindRoute kind="artist">
              <ArtistOnboardingContract />
            </ProtectedKindRoute>
          }
        />
      </Route>

      <Route element={<AdminLayout />}>
        <Route path="admin" element={<Navigate to="artists" replace />} />
        <Route
          path="admin/artists"
          element={
            <ProtectedKindRoute kind="admin">
              <AdminArtists />
            </ProtectedKindRoute>
          }
        />
        <Route
          path="admin/bookings"
          element={
            <ProtectedKindRoute kind="admin">
              <AdminBookings />
            </ProtectedKindRoute>
          }
        />
        <Route
          path="admin/artists/:id"
          element={
            <ProtectedKindRoute kind="admin">
              <AdminArtistEdit />
            </ProtectedKindRoute>
          }
        />
        <Route
          path="admin/bookings/new"
          element={
            <ProtectedKindRoute kind="admin">
              <AdminBookingNew />
            </ProtectedKindRoute>
          }
        />
        <Route
          path="admin/bookings/:id"
          element={
            <ProtectedKindRoute kind="admin">
              <AdminBookingDetail />
            </ProtectedKindRoute>
          }
        />
        <Route
          path="admin/content"
          element={
            <ProtectedKindRoute kind="admin">
              <AdminContent />
            </ProtectedKindRoute>
          }
        />
        <Route
          path="admin/settings"
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

function I18nRouter() {
  return (
    <Routes>
      <Route path="/:lang/*" element={<LocalizedApp />} />
      <Route path={PAGES.main} element={<LangRedirect />} />
      <Route path="*" element={<LangRedirect />} />
    </Routes>
  );
}

export default I18nRouter;
