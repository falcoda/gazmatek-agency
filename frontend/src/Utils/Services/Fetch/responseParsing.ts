/** Shape of the JSON error envelope returned by the API. */
export interface ApiErrorBody {
  message?: string;
  details?: { message?: string }[];
}

export const GENERIC_ERROR_MESSAGE = "Une erreur est survenue";

/**
 * Picks the most specific human-readable message from a parsed API error body:
 * the first validation detail, then the top-level message, then a fallback.
 */
export function extractApiErrorMessage(
  body: ApiErrorBody | null | undefined,
  fallback: string = GENERIC_ERROR_MESSAGE,
): string {
  const firstDetail =
    Array.isArray(body?.details) && body.details.length > 0
      ? body.details[0]?.message
      : null;
  return firstDetail ?? body?.message ?? fallback;
}

/** Safely parses a JSON error body, returning `null` when it isn't JSON. */
export async function parseErrorBody(
  response: Response,
): Promise<ApiErrorBody | null> {
  try {
    return (await response.json()) as ApiErrorBody;
  } catch {
    return null;
  }
}

/** True when the response carries a binary download (PDF or CSV). */
export function isDownloadContentType(contentType: string | null): boolean {
  return Boolean(
    contentType &&
    (contentType.includes("application/pdf") ||
      contentType.includes("text/csv")),
  );
}
