// Contract service constants (Rule 4: no magic strings).

// Suffix appended to a contract's draft PDF storage key to derive the storage
// key of its signed counterpart. Kept here so the webhook service and any
// future consumer share a single source of truth.
export const SIGNED_PDF_SUFFIX = ".signed.pdf";

// Documenso webhook event names that signal a fully completed (signed by all
// recipients) document. Documenso has emitted both the screaming-snake-case and
// dotted variants across versions, so both are accepted.
export const DOCUMENSO_COMPLETION_EVENTS = [
  "DOCUMENT_COMPLETED",
  "document.completed",
] as const;
