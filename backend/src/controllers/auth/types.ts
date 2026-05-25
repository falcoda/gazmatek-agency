export interface RegisterBody {
  email: string;
  password: string;
}

export interface LoginBody {
  email: string;
  password: string;
}

export interface RefreshBody {
  refreshToken: string;
}

export interface ForgotPasswordBody {
  email: string;
}

export interface ResetPasswordBody {
  token: string;
  newPassword: string;
}

export interface AuthTokensResponse {
  accessToken: string;
  refreshToken: string;
}

export interface RegisterResponse extends AuthTokensResponse {
  user: {
    user_id: number;
    email: string;
  };
}

export interface LoginResponse extends AuthTokensResponse {
  user: {
    user_id: number;
    email: string;
  };
}

export type RefreshResponse = AuthTokensResponse;

export interface LogoutResponse {
  message: string;
}

export interface ForgotPasswordResponse {
  message: string;
}

export interface ResetPasswordResponse {
  message: string;
}
