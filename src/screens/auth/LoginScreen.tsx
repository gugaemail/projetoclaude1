import { zodResolver } from '@hookform/resolvers/zod';
import { isAxiosError } from 'axios';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { Button, HelperText, Snackbar, Text, TextInput } from 'react-native-paper';
import { z } from 'zod';

import { useAuthStore } from '../../store/authStore';
import { theme } from '../../theme';

const loginSchema = z.object({
  username: z.string().min(1, 'Usuário obrigatório'),
  password: z.string().min(1, 'Senha obrigatória'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const { login, isLoading } = useAuthStore();
  const [apiError, setApiError] = useState('');
  const [snackVisible, setSnackVisible] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: '', password: '' },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setApiError('');
      await login(data.username, data.password);
    } catch (error) {
      if (isAxiosError(error)) {
        if (error.response?.status === 401) {
          setApiError('Usuário ou senha inválidos. Verifique suas credenciais.');
        } else if (error.response?.status === 400) {
          setApiError('Requisição inválida (400). Verifique empresa/filial no .env.');
        } else if (error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK' || !error.response) {
          setApiError('Não foi possível conectar ao servidor. Verifique sua conexão e a URL da API.');
        } else {
          setApiError(`Erro no servidor (${error.response.status}). Tente novamente.`);
        }
      } else {
        setApiError('Erro inesperado. Tente novamente.');
      }
      setSnackVisible(true);
    }
  };

  const loading = isSubmitting || isLoading;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.inner}>
        <Text variant="headlineMedium" style={styles.title}>
          ProtheusApp
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Acesse sua conta para continuar
        </Text>

        <Controller
          control={control}
          name="username"
          render={({ field: { onChange, onBlur, value } }) => (
            <View style={styles.fieldWrapper}>
              <TextInput
                label="Usuário"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                autoCapitalize="none"
                autoCorrect={false}
                left={<TextInput.Icon icon="account" />}
                error={!!errors.username}
                disabled={loading}
                style={styles.input}
              />
              <HelperText type="error" visible={!!errors.username}>
                {errors.username?.message}
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
                left={<TextInput.Icon icon="lock" />}
                right={
                  <TextInput.Icon
                    icon={passwordVisible ? 'eye-off' : 'eye'}
                    onPress={() => setPasswordVisible((v) => !v)}
                  />
                }
                error={!!errors.password}
                disabled={loading}
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
          loading={loading}
          disabled={loading}
          style={styles.button}
          contentStyle={styles.buttonContent}
        >
          Entrar
        </Button>
      </View>

      <Snackbar
        visible={snackVisible}
        onDismiss={() => setSnackVisible(false)}
        duration={4000}
        action={{ label: 'OK', onPress: () => setSnackVisible(false) }}
      >
        {apiError}
      </Snackbar>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  title: {
    color: theme.colors.primary,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    color: theme.colors.onBackground,
    textAlign: 'center',
    marginBottom: 32,
    opacity: 0.7,
  },
  fieldWrapper: {
    marginBottom: 4,
  },
  input: {
    backgroundColor: theme.colors.surface,
  },
  button: {
    marginTop: 16,
    borderRadius: 8,
  },
  buttonContent: {
    paddingVertical: 6,
  },
});
