import { MD3LightTheme } from 'react-native-paper';

const palette = {
  primary: '#1565C0',
  primaryContainer: '#D0E4FF',
  secondary: '#0277BD',
  secondaryContainer: '#CCE5FF',
  surface: '#FFFFFF',
  background: '#F5F7FA',
  error: '#B00020',
  onPrimary: '#FFFFFF',
  onSecondary: '#FFFFFF',
  onSurface: '#1C1B1F',
  onBackground: '#1C1B1F',
  onError: '#FFFFFF',
};

export const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: palette.primary,
    primaryContainer: palette.primaryContainer,
    secondary: palette.secondary,
    secondaryContainer: palette.secondaryContainer,
    surface: palette.surface,
    background: palette.background,
    error: palette.error,
    onPrimary: palette.onPrimary,
    onSecondary: palette.onSecondary,
    onSurface: palette.onSurface,
    onBackground: palette.onBackground,
    onError: palette.onError,
  },
};

export type AppTheme = typeof theme;
