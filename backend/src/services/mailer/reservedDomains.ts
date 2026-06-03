import {
  RESERVED_EMAIL_DOMAINS,
  RESERVED_EMAIL_TLDS,
} from "@src/helpers/constants";

/**
 * Returns true when the recipient lives under an RFC 2606 / RFC 6761 reserved
 * namespace (example.com, *.test, *.invalid, localhost, …).
 *
 * Mail to these always bounces — they exist only for documentation and testing
 * — and the bounces get the sending domain blacklisted, so the mailer must
 * never attempt real delivery to them. The check is case-insensitive and also
 * catches sub-domains (e.g. `user@mail.example.com`).
 */
export function isReservedEmailRecipient(recipient: string): boolean {
  const at = recipient.lastIndexOf("@");
  if (at < 0) {
    return false;
  }

  const domain = recipient
    .slice(at + 1)
    .trim()
    .toLowerCase();
  if (!domain) {
    return false;
  }

  const matchesReservedDomain = RESERVED_EMAIL_DOMAINS.some(
    (reserved) => domain === reserved || domain.endsWith(`.${reserved}`),
  );
  if (matchesReservedDomain) {
    return true;
  }

  return RESERVED_EMAIL_TLDS.some(
    (tld) => domain === tld || domain.endsWith(`.${tld}`),
  );
}
