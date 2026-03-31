import { MaterialCommunityIcons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import ClientesScreen from '../screens/clientes/ClientesScreen';
import DashboardScreen from '../screens/dashboard/DashboardScreen';
import PedidosScreen from '../screens/pedidos/PedidosScreen';
import ProdutosScreen from '../screens/produtos/ProdutosScreen';
import { theme } from '../theme';

export type AppTabsParamList = {
  Dashboard: undefined;
  Pedidos: undefined;
  Clientes: undefined;
  Produtos: undefined;
};

const Tab = createBottomTabNavigator<AppTabsParamList>();

type TabIconProps = { color: string; size: number };

export default function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurface,
        tabBarStyle: { backgroundColor: theme.colors.surface },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ color, size }: TabIconProps) => (
            <MaterialCommunityIcons name="view-dashboard" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Pedidos"
        component={PedidosScreen}
        options={{
          tabBarIcon: ({ color, size }: TabIconProps) => (
            <MaterialCommunityIcons name="clipboard-list" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Clientes"
        component={ClientesScreen}
        options={{
          tabBarIcon: ({ color, size }: TabIconProps) => (
            <MaterialCommunityIcons name="account-group" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Produtos"
        component={ProdutosScreen}
        options={{
          tabBarIcon: ({ color, size }: TabIconProps) => (
            <MaterialCommunityIcons name="package-variant" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
