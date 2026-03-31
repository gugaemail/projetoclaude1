import axios, { AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';

export const TOKEN_KEY = 'auth_token';
export const REFRESH_TOKEN_KEY = 'auth_refresh_token';

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

const apiClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — inject Bearer token
apiClient.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const token = await SecureStore.getItemAsync(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor — handle 401 (refresh) and 5xx (retry)
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as AxiosRequestConfig & { _retryCount?: number };

    if (!config) return Promise.reject(error);

    // 401 — attempt token refresh
    if (error.response?.status === 401 && !(config as { _isRetryRefresh?: boolean })._isRetryRefresh) {
      try {
        const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
        if (!refreshToken) throw new Error('No refresh token');

        const { data } = await axios.post(
          `${process.env.EXPO_PUBLIC_API_URL}/api/oauth2/v1/token`,
          { grant_type: 'refresh_token', refresh_token: refreshToken },
        );

        await SecureStore.setItemAsync(TOKEN_KEY, data.access_token);
        if (data.refresh_token) {
          await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, data.refresh_token);
        }

        if (config.headers) {
          (config.headers as Record<string, string>).Authorization = `Bearer ${data.access_token}`;
        }
        (config as { _isRetryRefresh?: boolean })._isRetryRefresh = true;
        return apiClient(config);
      } catch {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
        await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
        return Promise.reject(error);
      }
    }

    // 5xx — retry up to MAX_RETRIES times with exponential backoff
    if (error.response && error.response.status >= 500) {
      config._retryCount = config._retryCount ?? 0;
      if (config._retryCount < MAX_RETRIES) {
        config._retryCount += 1;
        const delay = RETRY_DELAY_MS * config._retryCount;
        await new Promise((resolve) => setTimeout(resolve, delay));
        return apiClient(config);
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
