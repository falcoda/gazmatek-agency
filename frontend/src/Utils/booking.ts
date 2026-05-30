/**
 * Outstanding balance for a booking: the quoted total minus the deposit
 * already accounted for, never negative.
 */
export function computeRemainingCents(
  quotedTotalCents: number,
  depositAmountCents: number,
): number {
  return Math.max(quotedTotalCents - depositAmountCents, 0);
}
