import { config } from "@src/helpers/config";

/**
 * Generic HTML-to-PDF renderer.
 *
 * Takes a complete, self-contained HTML document (the caller owns the markup
 * and CSS, including `@page` rules) and returns an A4 PDF buffer. Shared by
 * any feature that needs a PDF export; specialised renderers (e.g.
 * `contractPdfRenderer`) wrap this with their own document template.
 */
export const renderHtmlToPdf = async (
  htmlDocument: string,
): Promise<Buffer> => {
  // Lazy import: puppeteer-core is ESM, so loading it eagerly at module level
  // breaks CommonJS consumers (e.g. the Jest test runner booting the app).
  const { default: puppeteer } = await import("puppeteer-core");

  const browser = config.puppeteer.browserWsEndpoint
    ? await puppeteer.connect({
        browserWSEndpoint: config.puppeteer.browserWsEndpoint,
      })
    : await puppeteer.launch({
        executablePath: config.puppeteer.executablePath || undefined,
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });

  try {
    const page = await browser.newPage();
    await page.setContent(htmlDocument, { waitUntil: "load" });

    return Buffer.from(
      await page.pdf({
        format: "A4",
        printBackground: true,
        preferCSSPageSize: true,
      }),
    );
  } finally {
    await browser.close();
  }
};
