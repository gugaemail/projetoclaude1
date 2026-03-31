import { zodResolver } from '@hookform/resolvers/zod';
import { isAxiosError } from 'axios';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { Button, HelperText, Snackbar, Text, TextInput } from 'react-native-paper';
import { z } from 'zod';

import { useAuthStore } from '../../store/authStore';
import { theme } from '../../theme';

const protheusSchema = z.object({
  username: z.string().min(1, 'Usuário Protheus obrigatório'),
  password: z.string().min(1, 'Senha Protheus obrigatória'),
  vendorCode: z.string().min(1, 'Código de vendedor obrigatório'),
});

type ProtheusFormData = z.infer<typeof protheusSchema>;

function getErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    if (error.response?.status === 401) {
      return 'Usuário ou senha do Protheus inválidos.';
    }
    if (error.response?.status === 400) {
      return 'Requisição inválida (400). Verifique empresa/filial no .env.';
    }
    if (!error.response) {
      return 'Sem conexão com o servidor Protheus. Verifique a URL da API.';
    }
    return `Erro no servidor (${error.response.status}). Tente novamente.`;
  }
  if (error instanceof Error) return error.message;
  return 'Erro inesperado. Tente novamente.';
}

export default function ProtheusSetupScreen() {
  const { setupProtheus, logout } = useAuthStore();
  const [errorMsg, setErrorMsg] = useState('');
  const [snackVisible, setSnackVisible] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<ProtheusFormData>({
    resolver: zodResolver(protheusSchema),
    defaultValues: { username: '', password: '', vendorCode: '' },
  });

  const onSubmit = async (data: ProtheusFormData) => {
    try {
      setErrorMsg('');
      await setupProtheus(data.username, data.password, data.vendorCode);
    } catch (err) {
      setErrorMsg(getErrorMessage(err));
      setSnackVisible(true);
    }
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
        <View style={styles.header}>
          <Text variant="headlineMedium" style={styles.title}>
            Configurar Protheus
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            Informe suas credenciais do sistema Protheus para conectar sua conta.
            Essas informações serão salvas para os próximos acessos.
          </Text>
        </View>

        <View style={styles.form}>
          <Controller
            control={control}
            name="username"
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={styles.fieldWrapper}>
                <TextInput
                  label="Usuário Protheus"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  autoCapitalize="none"
                  autoCorrect={false}
                  left={<TextInput.Icon icon="account" />}
                  error={!!errors.username}
                  disabled={isSubmitting}
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
                  label="Senha Protheus"
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
            name="vendorCode"
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={styles.fieldWrapper}>
                <TextInput
                  label="Código de Vendedor"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  autoCapitalize="characters"
                  autoCorrect={false}
                  left={<TextInput.Icon icon="badge-account" />}
                  error={!!errors.vendorCode}
                  disabled={isSubmitting}
                  style={styles.input}
                />
                <HelperText type="error" visible={!!errors.vendorCode}>
                  {errors.vendorCode?.message}
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
            Conectar ao Protheus
          </Button>

          <Button
            mode="text"
            onPress={() => void logout()}
            disabled={isSubmitting}
            style={styles.logoutButton}
          >
            Sair da conta
          </Button>
        </View>
      </ScrollView>

      <Snackbar
        visible={snackVisible}
        onDismiss={() => setSnackVisible(false)}
        duration={5000}
        action={{ label: 'OK', onPress: () => setSnackVisible(false) }}
      >
        {errorMsg}
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
  header: {
    backgroundColor: theme.colors.primaryContainer,
    paddingHorizontal: 24,
    paddingTop: 64,
    paddingBottom: 32,
  },
  title: {
    color: theme.colors.onPrimaryContainer,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    color: theme.colors.onPrimaryContainer,
    opacity: 0.8,
    lineHeight: 22,
  },
  form: {
    paddingHorizontal: 24,
    paddingTop: 32,
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
  logoutButton: {
    marginTop: 12,
  },
});
