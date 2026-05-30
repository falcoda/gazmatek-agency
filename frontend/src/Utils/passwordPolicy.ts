// Single source of truth for the client-side password rules. Keep this in
// sync with backend/src/helpers/auth/passwordPolicy.ts — both ends enforce the
// same minimum so users never see a backend rejection after a green local
// validation.
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;

export function isPasswordTooShort(password: string): boolean {
  return password.length < PASSWORD_MIN_LENGTH;
}
