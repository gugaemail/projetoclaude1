export interface LoginRequest {
  grant_type: 'password';
  username: string;
  password: string;
  company: string;
  branch: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: 'Bearer';
}

export type UserRole = 'vendedor' | 'supervisor' | 'gerente';

export interface AuthUser {
  code: string;
  name: string;
  role: UserRole;
  email?: string;
}

export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
