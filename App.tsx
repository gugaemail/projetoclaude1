import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { PaperProvider } from 'react-native-paper';

import { theme } from './src/theme';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      retry: 2,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <PaperProvider theme={theme}>
        <View style={styles.container}>
          <Text style={styles.text}>ProtheusApp</Text>
          <Text style={styles.subtitle}>Infraestrutura pronta</Text>
          <StatusBar style="auto" />
        </View>
      </PaperProvider>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.onBackground,
    marginTop: 8,
  },
});
