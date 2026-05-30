import { config } from "@src/helpers/config";

interface RenderContractPdfInput {
  htmlContent: string;
  title: string;
}

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const buildDocumentHtml = ({
  htmlContent,
  title,
}: RenderContractPdfInput): string => {
  const safeTitle = escapeHtml(title);

  return `<!doctype html>
<html lang="fr">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${safeTitle}</title>
    <style>
      @page {
        size: A4;
        margin: 18mm 16mm 22mm;
      }

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        color: #111827;
        font-family: "Georgia", "Times New Roman", serif;
        font-size: 12px;
        line-height: 1.58;
        background: #ffffff;
      }

      .contractDocument p,
      .contractDocument ul,
      .contractDocument ol,
      .contractDocument blockquote {
        margin: 0 0 10px;
      }

      .contractDocument h1,
      .contractDocument h2,
      .contractDocument h3,
      .contractDocument h4 {
        margin: 18px 0 8px;
        line-height: 1.25;
        page-break-after: avoid;
      }

      .contractDocument h1 {
        font-size: 18px;
        text-align: center;
      }

      .contractDocument h2 {
        font-size: 14px;
      }

      .contractDocument h3 {
        font-size: 13px;
      }

      .contractDocument ul,
      .contractDocument ol {
        padding-left: 22px;
      }

      .contractDocument li + li {
        margin-top: 4px;
      }

      .contractDocument hr {
        border: 0;
        border-top: 1px solid #d1d5db;
        margin: 16px 0;
      }

      .contractDocument table {
        width: 100%;
        border-collapse: collapse;
      }

      .contractDocument th,
      .contractDocument td {
        vertical-align: top;
      }

      .contractDocument .pageBreak {
        page-break-before: always;
      }
    </style>
  </head>
  <body>
    <section class="contractDocument">${htmlContent}</section>
  </body>
</html>`;
};

export const renderContractPdf = async (
  input: RenderContractPdfInput,
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
    await page.setContent(buildDocumentHtml(input), {
      waitUntil: "load",
    });

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
