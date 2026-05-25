import "./FaqAccordion.scss";

import { useState } from "react";
import { FiChevronDown } from "react-icons/fi";

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

  return (
    <div className="faqAccordion">
      {items.map((item, index) => {
        const isOpen = openIndex === index;

        return (
          <div
            className={`faqItem ${isOpen ? "faqItem--open" : ""}`}
            key={item.q}
          >
            <button
              type="button"
              className="faqQuestion"
              aria-expanded={isOpen}
              onClick={() => setOpenIndex(isOpen ? null : index)}
            >
              <span>{item.q}</span>
              <FiChevronDown className="faqChevron" />
            </button>
            <div className="faqAnswer">
              <p>{item.a}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default FaqAccordion;
