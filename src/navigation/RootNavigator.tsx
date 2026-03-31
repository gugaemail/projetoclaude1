import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { setLogoutCallback } from '../api/client';
import { useAuthStore } from '../store/authStore';
import { theme } from '../theme';
import AppDrawer from './AppDrawer';
import AuthStack from './AuthStack';

export default function RootNavigator() {
  const { isAuthenticated, isLoading, initialize, logout } = useAuthStore();

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

  return isAuthenticated ? <AppDrawer /> : <AuthStack />;
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.background,
  },
});
