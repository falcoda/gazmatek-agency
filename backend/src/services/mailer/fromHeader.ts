import { config } from "@src/helpers/config";

/**
 * Builds the "From" header as `Display Name <address>`.
 *
 * Without a display name, mail clients fall back to showing the local part of
 * the address — a bare "no-reply", which is what every recipient then sees as
 * the sender. The display name comes from `config.app.displayName`.
 */

/** RFC 5322: a quoted-string may not carry bare `"` or `\`. */
const escapeDisplayName = (name: string): string =>
  name.replace(/[\\"]/g, (char) => `\\${char}`);

export const buildFromHeader = (): string => {
  const address = config.mailer.from;
  // A `MAILER_FROM` that already carries its own display name (`Foo <a@b.com>`)
  // is deliberate configuration — leave it alone.
  if (address.includes("<")) return address;

  const displayName = config.app.displayName.trim();
  if (!displayName) return address;

  return `"${escapeDisplayName(displayName)}" <${address}>`;
};
