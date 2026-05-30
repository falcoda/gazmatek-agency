import "./Bio.scss";

import { useTranslation } from "react-i18next";

interface BioProps {
  bio: string | null;
}

const Bio = ({ bio }: BioProps) => {
  const { t } = useTranslation();
  if (!bio) return null;

  return (
    <section className="artistBio fi" aria-labelledby="artist-bio-title">
      <h2 id="artist-bio-title" className="title">
        {t("artistDetail.bio")}
      </h2>
      <p className="text">{bio}</p>
    </section>
  );
};

export default Bio;
