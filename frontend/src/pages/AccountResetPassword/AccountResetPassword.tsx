import "@/pages/AccountSignup/AccountSignup.scss";

import SetPasswordForm from "@/components/SetPasswordForm/SetPasswordForm";

const AccountResetPassword = () => (
  <SetPasswordForm
    i18nNamespace="account.reset"
    seoPath="/account/reset-password"
  />
);

export default AccountResetPassword;
