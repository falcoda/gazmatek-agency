import "./NoData.scss";

import { FaRegFolderOpen } from "react-icons/fa";

interface NoDataProps {
  title?: string;
}

const NoData = ({ title }: NoDataProps) => {
  return (
    <div className="noData">
      <FaRegFolderOpen className="noDataIcon" size={64} aria-hidden />

      {title && <span>{title}</span>}
    </div>
  );
};

export default NoData;
