import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { setLogoutCallback } from '../api/client';
import { useAuthStore } from '../store/authStore';
import { theme } from '../theme';
import AppDrawer from './AppDrawer';
import { AuthLoginStack, ProtheusSetupStack } from './AuthStack';

export default function RootNavigator() {
  const { isAuthenticated, isLoading, firebaseUid, initialize, logout } = useAuthStore();

  useEffect(() => {
    setLogoutCallback(() => {
      void logout();
    });
    void initialize();
  }, [initialize, logout]);

  if (isLoading) {
    return (
      <View style={styles.splash}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (isAuthenticated) return <AppDrawer />;
  if (firebaseUid) return <ProtheusSetupStack />;
  return <AuthLoginStack />;
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.background,
  },
});
