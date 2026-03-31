import type { AuthUser, TokenResponse, UserRole } from '../../types/auth';
import apiClient from '../client';

// Decode JWT payload without a library (base64url decode)
function decodeJwtPayload(token: string): Record<string, unknown> {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    );
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return {};
  }
}

export function parseUserFromToken(token: string): AuthUser {
  const payload = decodeJwtPayload(token);
  return {
    code: String(payload['sub'] ?? payload['userId'] ?? ''),
    name: String(payload['name'] ?? payload['username'] ?? 'Usuário'),
    role: (payload['role'] as UserRole) ?? 'vendedor',
    email: payload['email'] ? String(payload['email']) : undefined,
  };
}

export async function login(username: string, password: string): Promise<TokenResponse> {
  // Protheus: grant_type via query param, username/password via headers (não no body)
  const { data } = await apiClient.post<TokenResponse>(
    '/api/oauth2/v1/token',
    null, // sem body
    {
      params: { grant_type: 'password' },
      headers: {
        username,
        password,
        company: process.env.EXPO_PUBLIC_COMPANY ?? '01',
        branch: process.env.EXPO_PUBLIC_BRANCH ?? '01',
      },
    },
  );
  return data;
}
