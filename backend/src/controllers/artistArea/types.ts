// Cross-cutting HTTP contracts for the artist self-service area. Request body
// and query shapes live in @src/schemas/artistArea (Zod-inferred); response
// DTOs are produced by ArtistAreaService.

export interface ArtistMeResponse {
  id: string;
  email: string;
  stageName: string | null;
  // #4 — null until the engagement contract is signed; the frontend uses it to
  // gate sensitive actions, mirroring the server-side requireOnboardedArtist.
  onboardingCompletedAt: string | null;
}
