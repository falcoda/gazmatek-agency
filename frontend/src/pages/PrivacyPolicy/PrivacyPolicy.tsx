import LegalPage from "@/components/LegalPage/LegalPage";
import { PAGES } from "@/config/pages";

const PrivacyPolicy = () => {
  return <LegalPage namespace="privacy" path={PAGES.privacy} />;
};

export default PrivacyPolicy;
