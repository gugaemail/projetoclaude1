import { zodResolver } from '@hookform/resolvers/zod';
import { isAxiosError } from 'axios';
import * as Google from 'expo-auth-session/providers/google';
import { makeRedirectUri } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Divider, HelperText, Snackbar, Text, TextInput } from 'react-native-paper';
import { z } from 'zod';

import { useAuthStore } from '../../store/authStore';
import { theme } from '../../theme';

WebBrowser.maybeCompleteAuthSession();

const redirectUri = makeRedirectUri();

// --- Zod schemas ---
const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(1, 'Senha obrigatória'),
});

const registerSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
  confirmPassword: z.string().min(1, 'Confirme a senha'),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

function firebaseErrorMessage(code: string): string {
  const map: Record<string, string> = {
    'auth/user-not-found': 'Usuário não encontrado.',
    'auth/wrong-password': 'Senha incorreta.',
    'auth/email-already-in-use': 'E-mail já está em uso.',
    'auth/weak-password': 'Senha muito fraca. Use ao menos 6 caracteres.',
    'auth/invalid-email': 'E-mail inválido.',
    'auth/invalid-credential': 'Credenciais inválidas. Verifique e-mail e senha.',
    'auth/too-many-requests': 'Muitas tentativas. Aguarde alguns minutos.',
    'auth/network-request-failed': 'Sem conexão. Verifique sua internet.',
  };
  return map[code] ?? 'Erro ao autenticar. Tente novamente.';
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    const firebaseCode = (error as { code?: string }).code;
    if (firebaseCode) return firebaseErrorMessage(firebaseCode);
    if (isAxiosError(error)) {
      if (!error.response) return 'Sem conexão com o servidor.';
      return `Erro ${error.response.status}. Tente novamente.`;
    }
    return error.message;
  }
  return 'Erro inesperado. Tente novamente.';
}

// --- LoginTab ---
interface TabProps {
  onError: (msg: string) => void;
}

function LoginTab({ onError }: TabProps) {
  const { loginWithEmail } = useAuthStore();
  const [passwordVisible, setPasswordVisible] = useState(false);

  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await loginWithEmail(data.email, data.password);
    } catch (err) {
      onError(getErrorMessage(err));
    }
  };

  return (
    <>
      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, onBlur, value } }) => (
          <View style={styles.fieldWrapper}>
            <TextInput
              label="E-mail"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              left={<TextInput.Icon icon="email" />}
              error={!!errors.email}
              disabled={isSubmitting}
              style={styles.input}
            />
            <HelperText type="error" visible={!!errors.email}>
              {errors.email?.message}
            </HelperText>
          </View>
        )}
      />

      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, onBlur, value } }) => (
          <View style={styles.fieldWrapper}>
            <TextInput
              label="Senha"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              secureTextEntry={!passwordVisible}
              autoCapitalize="none"
              autoCorrect={false}
              left={<TextInput.Icon icon="lock" />}
              right={
                <TextInput.Icon
                  icon={passwordVisible ? 'eye-off' : 'eye'}
                  onPress={() => setPasswordVisible((v) => !v)}
                />
              }
              error={!!errors.password}
              disabled={isSubmitting}
              style={styles.input}
            />
            <HelperText type="error" visible={!!errors.password}>
              {errors.password?.message}
            </HelperText>
          </View>
        )}
      />

      <Button
        mode="contained"
        onPress={handleSubmit(onSubmit)}
        loading={isSubmitting}
        disabled={isSubmitting}
        style={styles.button}
        contentStyle={styles.buttonContent}
      >
        Entrar
      </Button>
    </>
  );
}

// --- RegisterTab ---
function RegisterTab({ onError }: TabProps) {
  const { registerWithEmail } = useAuthStore();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);

  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: '', password: '', confirmPassword: '' },
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await registerWithEmail(data.email, data.password);
    } catch (err) {
      onError(getErrorMessage(err));
    }
  };

  return (
    <>
      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, onBlur, value } }) => (
          <View style={styles.fieldWrapper}>
            <TextInput
              label="E-mail"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              left={<TextInput.Icon icon="email" />}
              error={!!errors.email}
              disabled={isSubmitting}
              style={styles.input}
            />
            <HelperText type="error" visible={!!errors.email}>
              {errors.email?.message}
            </HelperText>
          </View>
        )}
      />

      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, onBlur, value } }) => (
          <View style={styles.fieldWrapper}>
            <TextInput
              label="Senha"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              secureTextEntry={!passwordVisible}
              autoCapitalize="none"
              autoCorrect={false}
              left={<TextInput.Icon icon="lock" />}
              right={
                <TextInput.Icon
                  icon={passwordVisible ? 'eye-off' : 'eye'}
                  onPress={() => setPasswordVisible((v) => !v)}
                />
              }
              error={!!errors.password}
              disabled={isSubmitting}
              style={styles.input}
            />
            <HelperText type="error" visible={!!errors.password}>
              {errors.password?.message}
            </HelperText>
          </View>
        )}
      />

      <Controller
        control={control}
        name="confirmPassword"
        render={({ field: { onChange, onBlur, value } }) => (
          <View style={styles.fieldWrapper}>
            <TextInput
              label="Confirme a senha"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              secureTextEntry={!confirmVisible}
              autoCapitalize="none"
              autoCorrect={false}
              left={<TextInput.Icon icon="lock-check" />}
              right={
                <TextInput.Icon
                  icon={confirmVisible ? 'eye-off' : 'eye'}
                  onPress={() => setConfirmVisible((v) => !v)}
                />
              }
              error={!!errors.confirmPassword}
              disabled={isSubmitting}
              style={styles.input}
            />
            <HelperText type="error" visible={!!errors.confirmPassword}>
              {errors.confirmPassword?.message}
            </HelperText>
          </View>
        )}
      />

      <Button
        mode="contained"
        onPress={handleSubmit(onSubmit)}
        loading={isSubmitting}
        disabled={isSubmitting}
        style={styles.button}
        contentStyle={styles.buttonContent}
      >
        Cadastrar
      </Button>
    </>
  );
}

// --- Main Screen ---
export default function LoginScreen() {
  const [activeTab, setActiveTab] = useState<'cadastrar' | 'entrar'>('cadastrar');
  const [snackMsg, setSnackMsg] = useState('');
  const [snackVisible, setSnackVisible] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { loginWithGoogleCredential } = useAuthStore();

  const [, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    redirectUri,
  });

  const handledRef = useRef(false);

  const showError = (msg: string) => {
    setSnackMsg(msg);
    setSnackVisible(true);
  };

  useEffect(() => {
    if (response?.type === 'success' && !handledRef.current) {
      handledRef.current = true;
      const { id_token } = response.params;
      setGoogleLoading(true);
      loginWithGoogleCredential(id_token)
        .catch((err: unknown) => showError(getErrorMessage(err)))
        .finally(() => {
          setGoogleLoading(false);
          handledRef.current = false;
        });
    } else if (response?.type === 'error') {
      showError('Erro ao autenticar com Google. Tente novamente.');
    }
  }, [response, loginWithGoogleCredential]);

  const handleGooglePress = async () => {
    handledRef.current = false;
    await promptAsync();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Logo */}
        <View style={styles.logoArea}>
          <Text variant="headlineLarge" style={styles.logoText}>
            Addere
          </Text>
          <Text variant="bodyMedium" style={styles.logoSubtitle}>
            Sistema de Gestão Comercial
          </Text>
        </View>

        {/* Tab Bar */}
        <View style={styles.tabBar}>
          <Button
            mode={activeTab === 'cadastrar' ? 'contained' : 'text'}
            onPress={() => setActiveTab('cadastrar')}
            style={styles.tabButton}
            labelStyle={styles.tabLabel}
          >
            Cadastrar
          </Button>
          <Button
            mode={activeTab === 'entrar' ? 'contained' : 'text'}
            onPress={() => setActiveTab('entrar')}
            style={styles.tabButton}
            labelStyle={styles.tabLabel}
          >
            Entrar
          </Button>
        </View>

        {/* Form */}
        <View style={styles.formArea}>
          <Text variant="headlineSmall" style={styles.formTitle}>
            {activeTab === 'cadastrar' ? 'Criar Conta' : 'Acessar Conta'}
          </Text>
          <Text variant="bodyMedium" style={styles.formSubtitle}>
            {activeTab === 'cadastrar'
              ? 'Para começar, preencha os campos abaixo.'
              : 'Entre com suas credenciais.'}
          </Text>

          {activeTab === 'cadastrar'
            ? <RegisterTab onError={showError} />
            : <LoginTab onError={showError} />
          }

          <View style={styles.dividerRow}>
            <Divider style={styles.dividerLine} />
            <Text variant="bodySmall" style={styles.dividerText}>
              ou entre com
            </Text>
            <Divider style={styles.dividerLine} />
          </View>

          <Button
            mode="outlined"
            icon="google"
            onPress={handleGooglePress}
            loading={googleLoading}
            disabled={googleLoading}
            style={styles.googleButton}
            contentStyle={styles.buttonContent}
          >
            Continue with Google
          </Button>
        </View>
      </ScrollView>

      {/* Snackbar fora do ScrollView para não bloquear toques */}
      <Snackbar
        visible={snackVisible}
        onDismiss={() => setSnackVisible(false)}
        duration={4000}
        action={{ label: 'OK', onPress: () => setSnackVisible(false) }}
      >
        {snackMsg}
      </Snackbar>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scroll: {
    flexGrow: 1,
    paddingBottom: 32,
  },
  logoArea: {
    alignItems: 'center',
    paddingTop: 64,
    paddingBottom: 32,
    backgroundColor: theme.colors.primaryContainer,
  },
  logoText: {
    color: theme.colors.onPrimaryContainer,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  logoSubtitle: {
    color: theme.colors.onPrimaryContainer,
    opacity: 0.75,
    marginTop: 4,
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingTop: 24,
    gap: 8,
  },
  tabButton: {
    flex: 1,
    borderRadius: 8,
  },
  tabLabel: {
    fontSize: 14,
  },
  formArea: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  formTitle: {
    color: theme.colors.onBackground,
    fontWeight: '700',
    marginBottom: 4,
  },
  formSubtitle: {
    color: theme.colors.onSurfaceVariant,
    marginBottom: 20,
  },
  fieldWrapper: {
    marginBottom: 4,
  },
  input: {
    backgroundColor: theme.colors.surface,
  },
  button: {
    marginTop: 8,
    borderRadius: 8,
  },
  buttonContent: {
    paddingVertical: 6,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    gap: 8,
  },
  dividerLine: {
    flex: 1,
  },
  dividerText: {
    color: theme.colors.onSurfaceVariant,
  },
  googleButton: {
    borderRadius: 8,
    borderColor: theme.colors.outline,
  },
});
