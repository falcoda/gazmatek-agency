import { useMemo } from "react";

export const DOTS = "...";

const range = (start: number, end: number) => {
  const length = end - start + 1;
  return Array.from({ length }, (_, idx) => idx + start);
};

interface UsePaginationProps {
  totalCount: number;
  pageSize: number;
  siblingCount?: number;
  currentPage: number;
}
export const usePagination = ({
  totalCount,
  pageSize,
  siblingCount = 3, // the max number of pages to show on either side of the current page
  currentPage,
}: UsePaginationProps) => {
  const paginationRange = useMemo(() => {
    const totalPageCount = Math.ceil(totalCount / pageSize);
    const firstPageIndex = 1;
    const lastPageIndex = totalPageCount;
    const maxMiddlePages = siblingCount;

    // Show all pages if count is low
    if (totalPageCount <= 7) {
      return range(1, totalPageCount);
    }

    // Calculate bounds for middle range centered on current page
    const half = Math.floor(maxMiddlePages / 2);
    let start = Math.max(currentPage - half, 2);
    let end = Math.min(currentPage + half, totalPageCount - 1);

    // Adjust bounds if at the start or end of list
    if (currentPage <= 2) {
      start = 2;
      end = start + maxMiddlePages - 1;
    } else if (currentPage >= totalPageCount - 1) {
      end = totalPageCount - 1;
      start = end - maxMiddlePages + 1;
    }

    // Clamp to valid range
    start = Math.max(start, 2);
    end = Math.min(end, totalPageCount - 1);

    const middleRange = range(start, end);
    const showLeftDots = start > 2;
    const showRightDots = end < totalPageCount - 1;

    const result: (number | string)[] = [firstPageIndex];

    if (showLeftDots) result.push(DOTS);
    result.push(...middleRange);
    if (showRightDots) result.push(DOTS);
    result.push(lastPageIndex);

    return result;
  }, [totalCount, pageSize, currentPage]);

  return paginationRange;
};
