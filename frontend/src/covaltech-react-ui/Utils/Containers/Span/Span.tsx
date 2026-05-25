import "./Span.scss";
interface SpanProps {
  className?: string;
  children: string | React.ReactNode;
  style?:
    | "primary"
    | "secondary"
    | "lock"
    | "orange"
    | "yellow"
    | "valid"
    | "neutral"
    | "transparent";
  padding?: string;
  radius?: string;
  width?: string;
  height?: string;
}
const Span = ({
  className,
  children,
  style = "primary",
  padding = "6px 12px",
  radius = "6px",
  width = "auto",
  height = "30px",
}: SpanProps) => {
  return (
    <div
      className={`spanContainer ${className ?? ""} ${style}`}
      style={{ padding, borderRadius: radius, width, height }}
    >
      {children}
    </div>
  );
};

export default Span;
