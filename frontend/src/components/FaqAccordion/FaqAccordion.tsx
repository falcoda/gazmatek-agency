import "./FaqAccordion.scss";

import { useId, useState } from "react";
import { FiChevronDown } from "react-icons/fi";

import { Card } from "@/covaltech-react-ui";

export interface FaqItem {
  /** Question text. */
  q: string;
  /** Answer text. */
  a: string;
}

interface FaqAccordionProps {
  /** Question / answer pairs to render. */
  items: FaqItem[];
  /**
   * Index of the item open on first render. Pass `null` to start fully
   * collapsed. Defaults to `0`.
   */
  defaultOpenIndex?: number | null;
}

/** Generic expand/collapse accordion for a list of question/answer pairs. */
const FaqAccordion = ({ items, defaultOpenIndex = 0 }: FaqAccordionProps) => {
  const [openIndex, setOpenIndex] = useState<number | null>(defaultOpenIndex);
  const baseId = useId();

  return (
    <div className="faqAccordion">
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        const panelId = `${baseId}-panel-${index}`;
        const buttonId = `${baseId}-button-${index}`;

        return (
          <Card className={`faqItem ${isOpen ? "isOpen" : ""}`} key={item.q}>
            <button
              type="button"
              id={buttonId}
              className="faqQuestion"
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => setOpenIndex(isOpen ? null : index)}
            >
              <span>{item.q}</span>
              <FiChevronDown className="faqChevron" />
            </button>
            {/* Collapsed panels are taken out of the a11y tree and tab order
                via `inert` + `aria-hidden`, while the CSS grid animation keeps
                working (unlike `hidden`/`display:none`). (#62) */}
            <div
              className="faqAnswer"
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              aria-hidden={!isOpen}
              inert={!isOpen}
            >
              <p>{item.a}</p>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default FaqAccordion;
