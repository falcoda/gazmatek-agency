import LegalPage from "@/components/LegalPage/LegalPage";
import { PAGES } from "@/config/pages";

const TermsOfUses = () => {
  return <LegalPage namespace="terms" path={PAGES.terms} />;
};

export default TermsOfUses;
