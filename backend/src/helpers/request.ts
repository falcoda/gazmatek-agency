import type { Request } from "express";

/**
 * Express 5's `ParamsDictionary` types every param value as `string | string[]`
 * (regex routes can produce arrays). For our use-case all named params are
 * single strings, so this helper extracts them once with a tight assertion.
 */
export function getParam(req: Request, name: string): string {
  const value = (req.params as Record<string, string | string[] | undefined>)[
    name
  ];
  if (typeof value !== "string") {
    throw new Error(`Path parameter \`${name}\` is missing or not a string`);
  }
  return value;
}
