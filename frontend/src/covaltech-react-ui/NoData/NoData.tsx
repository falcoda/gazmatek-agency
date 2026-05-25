import "./NoData.scss";
import NoDataIcon from "./noData.svg?react";

interface NoDataProps {
  title?: string;
}

const NoData = ({ title }: NoDataProps) => {
  return (
    <div className="noData">
      <NoDataIcon />

      {title && <span>{title}</span>}
    </div>
  );
};

export default NoData;
