interface AgencyContractInfo {
  name: string | null;
  representative: string | null;
  address: string | null;
  city: string | null;
  companyNumber: string | null;
  vatNumber: string | null;
  email: string | null;
  iban: string | null;
}

interface EngagementContractInput {
  stageName: string;
  fullName: string | null;
  email: string;
  phone: string | null;
  address: string | null;
  country: string | null;
  vatNumber: string | null;
  companyNumber: string | null;
  /** Inline data URL (`data:image/png;base64,...`) for the agency signature
   *  pre-rendered in the agency column. `null` leaves the cell blank. */
  agencySignatureDataUrl: string | null;
  /** Agency company info edited from the admin settings page. */
  agency: AgencyContractInfo;
  /** Unused in the current template — kept for API compatibility. */
  agencyName: string;
  signedOnDate: string;
}

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const BLANK = "____________________";

const fieldOrBlank = (value: string | null | undefined): string =>
  value && value.trim().length > 0 ? escapeHtml(value) : BLANK;

// Agency block defaults — used only when an admin has not filled the
// corresponding field in `agency_settings` yet. The live values come from the
// `agency` input rendered from the admin settings page.
const AGENCY_DEFAULTS = {
  name: "Gazmatek Universe Booking",
  representative: "Thomas Gozes",
};

// Renders the engagement contract body — wrapped at render time by
// `renderContractPdf` which provides the outer <html>/<body>/styling.
export const renderEngagementContractHtml = (
  input: EngagementContractInput,
): string => {
  const stage = escapeHtml(input.stageName);
  const legalName = fieldOrBlank(input.fullName);
  const email = fieldOrBlank(input.email);
  const phone = fieldOrBlank(input.phone);
  const address = fieldOrBlank(input.address);
  const country = fieldOrBlank(input.country);
  const vatNumber = fieldOrBlank(input.vatNumber);
  const companyNumber = fieldOrBlank(input.companyNumber);
  const date = escapeHtml(input.signedOnDate);

  const agencyName = fieldOrBlank(input.agency.name ?? AGENCY_DEFAULTS.name);
  const agencyRep = fieldOrBlank(
    input.agency.representative ?? AGENCY_DEFAULTS.representative,
  );
  const agencyAddress = fieldOrBlank(input.agency.address);
  const agencyCity = fieldOrBlank(input.agency.city);
  const agencyCompanyNumber = fieldOrBlank(input.agency.companyNumber);
  const agencyVat = fieldOrBlank(input.agency.vatNumber);
  const agencyEmail = fieldOrBlank(input.agency.email);
  const agencyIban = fieldOrBlank(input.agency.iban);

  const partiesTable = `
    <table style="width:100%; border-collapse:collapse; margin-bottom:16px;">
      <thead>
        <tr>
          <th style="text-align:left; width:50%; border-bottom:1px solid #6b7280; padding:6px 8px;">THE AGENCY</th>
          <th style="text-align:left; width:50%; border-bottom:1px solid #6b7280; padding:6px 8px;">THE ARTIST</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="vertical-align:top; padding:6px 8px;"><strong>Name:</strong> ${agencyName}</td>
          <td style="vertical-align:top; padding:6px 8px;"><strong>Stage name:</strong> ${stage}</td>
        </tr>
        <tr>
          <td style="vertical-align:top; padding:6px 8px;"><strong>Representative:</strong> ${agencyRep}</td>
          <td style="vertical-align:top; padding:6px 8px;"><strong>Legal name:</strong> ${legalName}</td>
        </tr>
        <tr>
          <td style="vertical-align:top; padding:6px 8px;"><strong>Address:</strong> ${agencyAddress}</td>
          <td style="vertical-align:top; padding:6px 8px;"><strong>Address:</strong> ${address}</td>
        </tr>
        <tr>
          <td style="vertical-align:top; padding:6px 8px;"><strong>Company number (BCE/KBO):</strong> ${agencyCompanyNumber}</td>
          <td style="vertical-align:top; padding:6px 8px;"><strong>Country:</strong> ${country}</td>
        </tr>
        <tr>
          <td style="vertical-align:top; padding:6px 8px;"><strong>VAT:</strong> ${agencyVat}</td>
          <td style="vertical-align:top; padding:6px 8px;"><strong>Email:</strong> ${email}</td>
        </tr>
        <tr>
          <td style="vertical-align:top; padding:6px 8px;"><strong>Email:</strong> ${agencyEmail}</td>
          <td style="vertical-align:top; padding:6px 8px;"><strong>Phone:</strong> ${phone}</td>
        </tr>
        <tr>
          <td style="vertical-align:top; padding:6px 8px;"><strong>IBAN:</strong> ${agencyIban}</td>
          <td style="vertical-align:top; padding:6px 8px;"><strong>Company number / VAT:</strong> ${companyNumber !== BLANK ? companyNumber : vatNumber}</td>
        </tr>
      </tbody>
    </table>
  `;

  // The signature block is kept together via `page-break-inside: avoid` so it
  // never splits across pages; Documenso anchors the signer box on the LAST
  // page using `addSignatureField` — keep the artist signature cell large and
  // on the right column so the visual signature box and the e-signature
  // overlay line up.
  return `
    <h1>Artist Representation Agreement (Mandate)</h1>

    ${partiesTable}

    <h2>Article 1 — Scope</h2>
    <p>
      The Artist grants the Agency a mandate (tick):
      <span style="margin-left:6px;">☐ exclusive</span>
      <span style="margin-left:14px;">☐ non-exclusive</span>,
      to source, negotiate and conclude bookings (DJ set, live, hybrid) in Europe.
    </p>
    <p>
      The Agency acts as commercial intermediary and/or agent depending on each
      deal structure.
    </p>

    <h2>Article 2 — Agency commission (10%)</h2>
    <p>
      For each booking secured by the Agency, a commission of 10% is due on the
      negotiated gross fee (excl. VAT where applicable).
    </p>
    <p>
      <em>Example:</em> fee €1,000 → commission €100 → artist net €900
      (expenses excluded).
    </p>

    <h2>Article 3 — Payment flow</h2>
    <p>
      <strong>Option A (recommended):</strong> Organizer pays the total fee to
      the Agency; the Agency pays the Artist the net amount (fee − 10%).
    </p>
    <p>
      <strong>Option B:</strong> Organizer pays the Artist; the Artist pays the
      10% commission to the Agency within 7 days after receipt.
    </p>
    <p>
      Recommended schedule: 50% deposit on signature, balance before show /
      on show day (to be specified per booking).
    </p>

    <h2>Article 4 — Expenses</h2>
    <p>
      Expenses (travel, accommodation, meals, backline/tech rider, visas, etc.)
      are excluded unless agreed in writing. They can be reimbursed at cost or
      agreed as a package.
    </p>

    <h2>Article 5 — Non-circumvention</h2>
    <p>
      Any organizer introduced by the Agency is considered an Agency contact
      for 24 months. Direct deals with an introduced organizer without the
      Agency trigger the 10% commission.
    </p>

    <h2>Article 6 — Cancellation</h2>
    <p>Except force majeure:</p>
    <ul>
      <li>30+ days: no fee.</li>
      <li>7 to 30 days: 50% of the fee due.</li>
      <li>Less than 7 days: 100% of the fee due.</li>
    </ul>
    <p>Non-refundable costs already incurred remain due.</p>

    <h2>Article 7 — Term / Governing law</h2>
    <p>
      Term: 12 months, renewable unless 30 days written notice.
    </p>
    <p>
      Governing law: Belgian law. Venue: Brussels (Belgium), unless mandatory
      rules apply.
    </p>

    <div style="page-break-inside:avoid; margin-top:24px;">
      <h2 style="margin-top:0;">Signatures</h2>
      <p>
        Signed in: ${agencyCity} &nbsp;&nbsp; Date: ${date}
      </p>

      <table style="width:100%; border-collapse:collapse; margin-top:8px;">
        <thead>
          <tr>
            <th style="text-align:left; width:50%; border-bottom:1px solid #6b7280; padding:6px 8px;">For the Agency</th>
            <th style="text-align:left; width:50%; border-bottom:1px solid #6b7280; padding:6px 8px;">For the Artist</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="vertical-align:top; padding:6px 8px;"><strong>Name:</strong> ${agencyRep}</td>
            <td style="vertical-align:top; padding:6px 8px;"><strong>Name:</strong> ${legalName}</td>
          </tr>
          <tr>
            <td style="vertical-align:top; padding:8px;">
              <em>Signature:</em>
              <div style="height:70px; display:flex; align-items:flex-end;">
                ${
                  input.agencySignatureDataUrl
                    ? `<img src="${input.agencySignatureDataUrl}" alt="Agency signature" style="max-height:64px; max-width:220px; object-fit:contain;" />`
                    : "&nbsp;"
                }
              </div>
              <div style="border-top:1px solid #6b7280;">&nbsp;</div>
            </td>
            <td style="vertical-align:top; padding:8px;">
              <em>Signature:</em>
              <div style="margin-top:70px; border-top:1px solid #6b7280;">&nbsp;</div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `;
};
