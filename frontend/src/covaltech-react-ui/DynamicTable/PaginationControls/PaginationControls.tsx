import "./PaginationControls.scss";

import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

import Button from "../../Button/Button";
import { DOTS, usePagination } from "../../hooks/usePagination";

interface PaginationControlsProps {
  totalCount: number;
  pageSize: number;
  siblingCount?: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}

const PaginationControls = ({
  totalCount,
  pageSize,
  siblingCount = 1,
  currentPage,
  onPageChange,
}: PaginationControlsProps) => {
  const paginationRange = usePagination({
    currentPage,
    totalCount,
    siblingCount,
    pageSize,
  });

  const onNext = () => {
    if (currentPage < Number(lastPage)) {
      onPageChange(currentPage + 1);
    }
  };

  const onPrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const lastPage = paginationRange[paginationRange.length - 1];

  return (
    <span className="paginationControls">
      <Button
        className={"pagination-item"}
        onClick={onPrevious}
        style="square"
        icon={<FaChevronLeft />}
        disabled={currentPage === 1}
      />
      <span className="paginationNumberContainer">
        {paginationRange.map((pageNumber, index) => {
          if (pageNumber === DOTS) {
            // Use a unique key for each DOTS instance based on its position
            return (
              <Button
                key={`dots-${index}`}
                className="dots"
                style="transparent"
                width={34}
                height={34}
              >
                &#8230;
              </Button>
            );
          }

          return (
            <Button
              key={pageNumber} // Use pageNumber as the key for page buttons
              className={`paginationNumber ${
                pageNumber === currentPage ? "selected" : ""
              }`}
              onClick={() => onPageChange(pageNumber as number)}
              style="transparent"
              width={34}
              height={34}
            >
              {pageNumber}
            </Button>
          );
        })}
      </span>
      <Button
        className={"pagination-item"}
        onClick={onNext}
        style="square"
        icon={<FaChevronRight />}
        disabled={currentPage === lastPage || totalCount === 0}
      />
    </span>
  );
};

export default PaginationControls;
