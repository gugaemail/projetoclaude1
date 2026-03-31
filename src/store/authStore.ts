import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithCredential,
  signOut,
  GoogleAuthProvider,
  type User as FirebaseUser,
} from 'firebase/auth';
import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';

import { login as apiLogin } from '../api/endpoints/auth';
import { TOKEN_KEY, REFRESH_TOKEN_KEY } from '../api/client';
import { firebaseAuth } from '../config/firebase';
import type { AuthUser, UserRole } from '../types/auth';

// All stored in SecureStore (works with Expo Go, no native build needed)
const PROTHEUS_PASSWORD_KEY = 'protheus_password';
const FIREBASE_UID_KEY = 'firebase_uid';
const FIREBASE_EMAIL_KEY = 'firebase_email';
const FIREBASE_NAME_KEY = 'firebase_name';
const PROTHEUS_USERNAME_KEY = 'protheus_username';
const PROTHEUS_VENDOR_CODE_KEY = 'protheus_vendor_code';

interface AuthState {
  firebaseUid: string | null;
  user: AuthUser | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthActions {
  initialize: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (email: string, password: string) => Promise<void>;
  loginWithGoogleCredential: (idToken: string) => Promise<void>;
  setupProtheus: (username: string, password: string, vendorCode: string) => Promise<void>;
  logout: () => Promise<void>;
  setTokens: (token: string, refreshToken: string) => Promise<void>;
}

type AuthStore = AuthState & AuthActions;

async function buildUser(firebaseUser: FirebaseUser | null, vendorCode: string, role: UserRole = 'vendedor'): Promise<AuthUser> {
  const savedName = await SecureStore.getItemAsync(FIREBASE_NAME_KEY);
  const savedEmail = await SecureStore.getItemAsync(FIREBASE_EMAIL_KEY);
  return {
    code: vendorCode,
    name: firebaseUser?.displayName ?? savedName ?? 'Usuário',
    role,
    email: firebaseUser?.email ?? savedEmail ?? undefined,
  };
}

async function tryProtheusAutoLogin(
  firebaseUser: FirebaseUser | null,
): Promise<Partial<AuthState>> {
  const username = await SecureStore.getItemAsync(PROTHEUS_USERNAME_KEY);
  const vendorCode = await SecureStore.getItemAsync(PROTHEUS_VENDOR_CODE_KEY);
  const password = await SecureStore.getItemAsync(PROTHEUS_PASSWORD_KEY);

  if (!username || !vendorCode || !password) {
    return {};
  }

  try {
    const tokenResponse = await apiLogin(username, password);
    await SecureStore.setItemAsync(TOKEN_KEY, tokenResponse.access_token);
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, tokenResponse.refresh_token);
    const user = await buildUser(firebaseUser, vendorCode);
    return {
      user,
      token: tokenResponse.access_token,
      refreshToken: tokenResponse.refresh_token,
      isAuthenticated: true,
    };
  } catch {
    // Protheus login failed — stay on ProtheusSetupScreen
    return {};
  }
}

export const useAuthStore = create<AuthStore>((set) => ({
  firebaseUid: null,
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: true,

  initialize: async () => {
    const savedUid = await SecureStore.getItemAsync(FIREBASE_UID_KEY);
    if (!savedUid) {
      set({ isLoading: false });
      return;
    }
    const protheusState = await tryProtheusAutoLogin(null);
    set({ firebaseUid: savedUid, ...protheusState, isLoading: false });
  },

  loginWithEmail: async (email: string, password: string) => {
    const result = await signInWithEmailAndPassword(firebaseAuth, email, password);
    const { uid, displayName } = result.user;
    await SecureStore.setItemAsync(FIREBASE_UID_KEY, uid);
    if (email) await SecureStore.setItemAsync(FIREBASE_EMAIL_KEY, email);
    if (displayName) await SecureStore.setItemAsync(FIREBASE_NAME_KEY, displayName);

    const protheusState = await tryProtheusAutoLogin(result.user);
    set({ firebaseUid: uid, ...protheusState });
  },

  registerWithEmail: async (email: string, password: string) => {
    const result = await createUserWithEmailAndPassword(firebaseAuth, email, password);
    const { uid, displayName } = result.user;
    await SecureStore.setItemAsync(FIREBASE_UID_KEY, uid);
    if (email) await SecureStore.setItemAsync(FIREBASE_EMAIL_KEY, email);
    if (displayName) await SecureStore.setItemAsync(FIREBASE_NAME_KEY, displayName);
    set({ firebaseUid: uid });
  },

  loginWithGoogleCredential: async (idToken: string) => {
    const credential = GoogleAuthProvider.credential(idToken);
    const result = await signInWithCredential(firebaseAuth, credential);
    const { uid, email, displayName } = result.user;
    await SecureStore.setItemAsync(FIREBASE_UID_KEY, uid);
    if (email) await SecureStore.setItemAsync(FIREBASE_EMAIL_KEY, email);
    if (displayName) await SecureStore.setItemAsync(FIREBASE_NAME_KEY, displayName);

    const protheusState = await tryProtheusAutoLogin(result.user);
    set({ firebaseUid: uid, ...protheusState });
  },

  setupProtheus: async (username: string, password: string, vendorCode: string) => {
    const tokenResponse = await apiLogin(username, password);
    await SecureStore.setItemAsync(TOKEN_KEY, tokenResponse.access_token);
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, tokenResponse.refresh_token);
    await SecureStore.setItemAsync(PROTHEUS_PASSWORD_KEY, password);
    await SecureStore.setItemAsync(PROTHEUS_USERNAME_KEY, username);
    await SecureStore.setItemAsync(PROTHEUS_VENDOR_CODE_KEY, vendorCode);

    const savedUid = await SecureStore.getItemAsync(FIREBASE_UID_KEY);
    const user = await buildUser(null, vendorCode);
    set({
      user,
      token: tokenResponse.access_token,
      refreshToken: tokenResponse.refresh_token,
      isAuthenticated: true,
      firebaseUid: savedUid ?? '',
    });
  },

  logout: async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    await SecureStore.deleteItemAsync(PROTHEUS_PASSWORD_KEY);
    await SecureStore.deleteItemAsync(FIREBASE_UID_KEY);
    await SecureStore.deleteItemAsync(FIREBASE_EMAIL_KEY);
    await SecureStore.deleteItemAsync(FIREBASE_NAME_KEY);
    await SecureStore.deleteItemAsync(PROTHEUS_USERNAME_KEY);
    await SecureStore.deleteItemAsync(PROTHEUS_VENDOR_CODE_KEY);
    try {
      await signOut(firebaseAuth);
    } catch {
      // Ignore Firebase sign-out errors
    }
    set({ firebaseUid: null, user: null, token: null, refreshToken: null, isAuthenticated: false });
  },

  setTokens: async (token: string, refreshToken: string) => {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
    set({ token, refreshToken });
  },
}));
