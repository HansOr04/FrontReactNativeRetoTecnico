import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { useProducts } from '../../application/hooks/useProducts';
import { Colors } from '../../constants/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'ProductDetail'>;

/**
 * Displays the full details of a product with edit and delete actions.
 * Deletion shows a confirmation dialog before calling the repository.
 */
export const ProductDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { product } = route.params;
  const { deleteProduct } = useProducts();

  const handleEdit = () => navigation.navigate('ProductForm', { product });

  const handleDelete = () => {
    Alert.alert(
      'Eliminar producto',
      `¿Deseas eliminar "${product.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            const success = await deleteProduct(product.id);
            if (success) {
              navigation.goBack();
            } else {
              Alert.alert('Error', 'No se pudo eliminar el producto');
            }
          },
        },
      ],
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <Image
        source={{ uri: product.logo }}
        style={styles.logo}
        resizeMode="contain"
      />

      <View style={styles.card}>
        <Row label="ID" value={product.id} />
        <Row label="Nombre" value={product.name} />
        <Row label="Descripción" value={product.description} />
        <Row label="Fecha Liberación" value={product.date_release} />
        <Row label="Fecha Revisión" value={product.date_revision} />
      </View>

      <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
        <Text style={styles.editButtonText}>Editar</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
        <Text style={styles.deleteButtonText}>Eliminar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const Row: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <View style={styles.row}>
    <Text style={styles.rowLabel}>{label}</Text>
    <Text style={styles.rowValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.backgroundSecondary },
  content: { padding: 16 },
  logo: {
    width: '100%',
    height: 120,
    backgroundColor: Colors.backgroundPrimary,
    borderRadius: 8,
    marginBottom: 16,
  },
  card: {
    backgroundColor: Colors.backgroundPrimary,
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#00000020',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 2,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderDefault,
  },
  rowLabel: { fontSize: 14, color: Colors.textSecondary, flex: 1 },
  rowValue: { fontSize: 14, color: Colors.textPrimary, flex: 2, textAlign: 'right' },
  editButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  editButtonText: { fontSize: 16, fontWeight: '600', color: Colors.textPrimary },
  deleteButton: {
    backgroundColor: Colors.backgroundPrimary,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.danger,
  },
  deleteButtonText: { fontSize: 16, fontWeight: '600', color: Colors.danger },
});
