import "./SocialProof.scss";

import { useTranslation } from "react-i18next";

import Bounded from "@/components/Bounded/Bounded";
import Section from "@/components/Section/Section";
import Surface from "@/components/Surface/Surface";

interface Testimonial {
  id: string;
  who: string;
  quote: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    id: "festival-1",
    who: "Lucas — Festival Open Air",
    quote:
      "Gazmatek a réuni 3 artistes complémentaires pour notre soirée d'ouverture. Programmation millimétrée, public ravi.",
  },
  {
    id: "wedding",
    who: "Sophie & Marc — Mariage",
    quote:
      "Coordination ultra-pro, l'animateur a parfaitement adapté son set à notre cérémonie bilingue. Aucun stress, que du plaisir.",
  },
  {
    id: "brand",
    who: "Aïcha — Brand Agency",
    quote:
      "Brief reçu un lundi, line-up confirmé le mercredi, événement lancé le samedi. Réactivité bluffante.",
  },
];

const SocialProof = () => {
  const { t } = useTranslation();

  return (
    <Section className="socialProof fi" data-section="socialProof">
      <Bounded width="wide" className="inner">
        <h2 className="title">{t("home.socialProof.title")}</h2>
        <p className="subtitle">{t("home.socialProof.subtitle")}</p>

        <ul className="list">
          {TESTIMONIALS.map((item) => (
            <Surface as="li" key={item.id} className="card fi">
              <blockquote>
                <p>&laquo;&nbsp;{item.quote}&nbsp;&raquo;</p>
                <footer>{item.who}</footer>
              </blockquote>
            </Surface>
          ))}
        </ul>
      </Bounded>
    </Section>
  );
};

export default SocialProof;
