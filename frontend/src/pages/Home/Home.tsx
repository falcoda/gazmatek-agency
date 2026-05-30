import "./Home.scss";

import { useTranslation } from "react-i18next";

import SeoHead from "@/components/SeoHead/SeoHead";
import useScrollAnimation from "@/hooks/useScrollAnimation";

import CtaBanner from "./CtaBanner/CtaBanner";
import FeaturedArtists from "./FeaturedArtists/FeaturedArtists";
import Hero from "./Hero/Hero";
import HomeFaq from "./HomeFaq/HomeFaq";
import OurStory from "./OurStory/OurStory";
import PartnersBand from "./PartnersBand/PartnersBand";
import PricingGrid from "./PricingGrid/PricingGrid";
import PricingTeaser from "./PricingTeaser/PricingTeaser";
import Process from "./Process/Process";
import ServicesGrid from "./ServicesGrid/ServicesGrid";
import SocialProof from "./SocialProof/SocialProof";

const Home = () => {
  const { t } = useTranslation();
  useScrollAnimation();

  return (
    <div className="home">
      <SeoHead
        title={t("seo.home.title")}
        description={t("seo.home.description")}
        path="/"
      />
      <Hero />
      <PartnersBand />
      <ServicesGrid />
      <Process />
      <FeaturedArtists />
      <OurStory />
      <PricingGrid />
      <PricingTeaser />
      <SocialProof />
      <HomeFaq />
      <CtaBanner />
    </div>
  );
};

export default Home;
