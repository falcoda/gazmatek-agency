import "./SocialProof.scss";

import { useTranslation } from "react-i18next";

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
    <section className="socialProof fi" data-section="socialProof">
      <div className="inner">
        <h2 className="title">{t("home.socialProof.title")}</h2>
        <p className="subtitle">{t("home.socialProof.subtitle")}</p>

        <ul className="list">
          {TESTIMONIALS.map((item) => (
            <li key={item.id} className="card fi">
              <blockquote>
                <p>&laquo;&nbsp;{item.quote}&nbsp;&raquo;</p>
                <footer>{item.who}</footer>
              </blockquote>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default SocialProof;
