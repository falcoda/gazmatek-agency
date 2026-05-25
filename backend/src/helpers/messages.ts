export const EXAMPLE_SUCCESS_MESSAGES = {
  CREATED: "example added successfully",
  UPDATED: "example updated successfully",
  DELETED: "example deleted successfully",
} as const;

export const AUTH_SUCCESS_MESSAGES = {
  REGISTERED: "User registered successfully",
  LOGGED_IN: "Login successful",
  REFRESHED: "Token refreshed successfully",
  LOGGED_OUT: "Logout successful",
  PASSWORD_RESET_REQUESTED:
    "If an account exists for that email, a reset link has been sent",
  PASSWORD_RESET: "Password reset successfully",
} as const;
