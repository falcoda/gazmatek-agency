/**
 * Counts the number of pages in a PDF buffer by parsing the page tree.
 *
 * Looks for `/Type /Pages` and extracts the nearby `/Count` (the page-tree
 * root). Falls back to a single `/Count` match for simple PDFs, then to 1.
 * Used to anchor signature fields on the last page of a generated contract.
 */
export const countPdfPages = (buffer: Buffer): number => {
  try {
    const text = buffer.toString("latin1");

    const pageTreeIdx = text.indexOf("/Type /Pages");
    if (pageTreeIdx !== -1) {
      const window = text.slice(
        Math.max(0, pageTreeIdx - 500),
        pageTreeIdx + 500,
      );
      const match = window.match(/\/Count\s+(\d+)/);
      if (match) return Math.max(1, parseInt(match[1], 10));
    }

    const allCounts = [...text.matchAll(/\/Count\s+(\d+)/g)];
    if (allCounts.length === 1) {
      return Math.max(1, parseInt(allCounts[0][1], 10));
    }
  } catch {
    // fallback to page 1
  }
  return 1;
};
