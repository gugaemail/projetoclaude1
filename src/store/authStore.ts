import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';

import { login as apiLogin, parseUserFromToken } from '../api/endpoints/auth';
import { TOKEN_KEY, REFRESH_TOKEN_KEY } from '../api/client';
import type { AuthState, AuthUser } from '../types/auth';

interface AuthActions {
  initialize: () => Promise<void>;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setTokens: (token: string, refreshToken: string) => Promise<void>;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: true,

  initialize: async () => {
    try {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
      if (token) {
        const user: AuthUser = parseUserFromToken(token);
        set({ user, token, refreshToken, isAuthenticated: true, isLoading: false });
        return;
      }
    } catch {
      // Token inválido ou erro de leitura — continuar sem autenticação
    }
    set({ isLoading: false });
  },

  login: async (username: string, password: string) => {
    const tokenResponse = await apiLogin(username, password);
    const user = parseUserFromToken(tokenResponse.access_token);
    await SecureStore.setItemAsync(TOKEN_KEY, tokenResponse.access_token);
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, tokenResponse.refresh_token);
    set({
      user,
      token: tokenResponse.access_token,
      refreshToken: tokenResponse.refresh_token,
      isAuthenticated: true,
    });
  },

  logout: async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    set({ user: null, token: null, refreshToken: null, isAuthenticated: false });
  },

  setTokens: async (token: string, refreshToken: string) => {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
    const user = parseUserFromToken(token);
    set({ user, token, refreshToken, isAuthenticated: true });
  },
}));
