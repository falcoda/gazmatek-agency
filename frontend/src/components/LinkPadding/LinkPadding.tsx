import "./LinkPadding.scss";

interface LinkPaddingProps {
  children: React.ReactNode;
  className?: string;
}

const LinkPadding: React.FC<LinkPaddingProps> = ({
  children,
  className = "",
}) => {
  return <div className={`linkPadding ${className}`}>{children}</div>;
};

export default LinkPadding;
