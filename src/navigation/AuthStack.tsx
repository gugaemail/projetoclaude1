import { createStackNavigator } from '@react-navigation/stack';

import LoginScreen from '../screens/auth/LoginScreen';
import ProtheusSetupScreen from '../screens/auth/ProtheusSetupScreen';

export type AuthStackParamList = {
  Login: undefined;
  ProtheusSetup: undefined;
};

const Stack = createStackNavigator<AuthStackParamList>();

export function AuthLoginStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
    </Stack.Navigator>
  );
}

export function ProtheusSetupStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProtheusSetup" component={ProtheusSetupScreen} />
    </Stack.Navigator>
  );
}

// Legacy default export for backwards compatibility
export default AuthLoginStack;
