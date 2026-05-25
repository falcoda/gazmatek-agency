import "./Section.scss";
interface SectionProps {
  children: React.ReactNode;
  className?: string;
}

const Section = ({ children, className = "" }: SectionProps) => {
  return <section className={`section ${className}`}>{children}</section>;
};

export default Section;
