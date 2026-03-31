import {
  DrawerContentComponentProps,
  DrawerContentScrollView,
  createDrawerNavigator,
} from '@react-navigation/drawer';
import { StyleSheet, View } from 'react-native';
import { Avatar, Button, Divider, Text } from 'react-native-paper';

import { useAuthStore } from '../store/authStore';
import { theme } from '../theme';
import AppTabs from './AppTabs';

export type AppDrawerParamList = {
  Home: undefined;
};

const Drawer = createDrawerNavigator<AppDrawerParamList>();

function DrawerContent(props: DrawerContentComponentProps) {
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    props.navigation.closeDrawer();
    await logout();
  };

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={styles.drawerContainer}>
      <View style={styles.userSection}>
        <Avatar.Text
          size={56}
          label={user?.name ? user.name.substring(0, 2).toUpperCase() : 'US'}
          style={styles.avatar}
        />
        <Text variant="titleMedium" style={styles.userName}>
          {user?.name ?? 'Usuário'}
        </Text>
        <Text variant="bodySmall" style={styles.userRole}>
          {user?.role ?? ''}
        </Text>
      </View>

      <Divider style={styles.divider} />

      <View style={styles.footer}>
        <Button
          mode="outlined"
          icon="logout"
          onPress={handleLogout}
          textColor={theme.colors.error}
          style={styles.logoutButton}
        >
          Sair
        </Button>
      </View>
    </DrawerContentScrollView>
  );
}

export default function AppDrawer() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <DrawerContent {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Drawer.Screen name="Home" component={AppTabs} />
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
  },
  userSection: {
    paddingVertical: 24,
    paddingHorizontal: 16,
    backgroundColor: theme.colors.primaryContainer,
    alignItems: 'center',
  },
  avatar: {
    backgroundColor: theme.colors.primary,
    marginBottom: 12,
  },
  userName: {
    color: theme.colors.onBackground,
    fontWeight: 'bold',
  },
  userRole: {
    color: theme.colors.onBackground,
    opacity: 0.7,
    textTransform: 'capitalize',
    marginTop: 2,
  },
  divider: {
    marginVertical: 8,
  },
  footer: {
    padding: 16,
    marginTop: 'auto',
  },
  logoutButton: {
    borderColor: theme.colors.error,
  },
});
