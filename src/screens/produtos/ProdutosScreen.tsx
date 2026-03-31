import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

import { theme } from '../../theme';

export default function ProdutosScreen() {
  return (
    <View style={styles.container}>
      <Text variant="headlineSmall">Produtos</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.background,
  },
});
