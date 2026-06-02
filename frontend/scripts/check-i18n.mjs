// CI key-drift guard for the i18n locale files.
//
// Flattens every locale JSON to dot-separated leaf keys and fails when any
// locale is missing keys that another locale defines. The union of all locales
// is the reference set, so adding a key to a single file without backfilling
// the others is caught here before it ships and silently falls back to French.
//
// Run via `npm run i18n:check`.

import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const translationsDir = resolve(here, "../src/i18n/translations");

const LOCALES = ["en", "fr", "nl"];

/** Flatten a nested object to a set of dot-separated leaf-key paths. */
function flatten(value, prefix, out) {
  if (Array.isArray(value)) {
    // Arrays are treated as leaves: we only compare that the key exists, not
    // per-index contents (legal sections etc. legitimately differ in length).
    out.add(prefix);
    return;
  }
  if (value && typeof value === "object") {
    for (const [key, child] of Object.entries(value)) {
      flatten(child, prefix ? `${prefix}.${key}` : key, out);
    }
    return;
  }
  out.add(prefix);
}

function loadKeys(locale) {
  const file = resolve(translationsDir, `${locale}.json`);
  const json = JSON.parse(readFileSync(file, "utf8"));
  const keys = new Set();
  flatten(json, "", keys);
  keys.delete("");
  return keys;
}

const keysByLocale = new Map(LOCALES.map((l) => [l, loadKeys(l)]));

const union = new Set();
for (const keys of keysByLocale.values()) {
  for (const key of keys) union.add(key);
}

let hasDrift = false;
for (const locale of LOCALES) {
  const keys = keysByLocale.get(locale);
  const missing = [...union].filter((key) => !keys.has(key)).sort();
  if (missing.length > 0) {
    hasDrift = true;
    console.error(`\n[i18n] ${locale}.json is missing ${missing.length} key(s):`);
    for (const key of missing) console.error(`  - ${key}`);
  }
}

if (hasDrift) {
  console.error("\ni18n key drift detected — backfill the missing keys.");
  process.exit(1);
}

console.log(`i18n locales in sync (${union.size} keys across ${LOCALES.join(", ")}).`);
