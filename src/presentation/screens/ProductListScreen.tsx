import React from 'react';
import {
  View,
  FlatList,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { useProducts } from '../../application/hooks/useProducts';
import { ProductItem } from '../components/ProductItem';
import { SearchBar } from '../components/SearchBar';
import { Colors } from '../../constants/colors';
import type { Product } from '../../domain/model/Product';

type Props = NativeStackScreenProps<RootStackParamList, 'ProductList'>;

/**
 * Main screen displaying the searchable, pull-to-refresh product list.
 * All business logic is delegated to useProducts.
 */
export const ProductListScreen: React.FC<Props> = ({ navigation }) => {
  const {
    filteredProducts,
    recordCount,
    searchQuery,
    setSearchQuery,
    isLoading,
    error,
    loadProducts,
  } = useProducts();

  const handlePress = (product: Product) =>
    navigation.navigate('ProductDetail', { product });

  const handleAdd = () => navigation.navigate('ProductForm', {});

  if (isLoading && filteredProducts.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadProducts}>
          <Text style={styles.retryText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Buscar por nombre o descripción..."
      />
      <View style={styles.countRow}>
        <Text style={styles.countText}>{recordCount} productos</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
          <Text style={styles.addButtonText}>+ Agregar</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ProductItem product={item} onPress={handlePress} />
        )}
        contentContainerStyle={styles.list}
        onRefresh={loadProducts}
        refreshing={isLoading}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No se encontraron productos</Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.backgroundSecondary },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: Colors.backgroundSecondary,
  },
  list: { paddingVertical: 8 },
  countRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 4,
  },
  countText: { fontSize: 14, color: Colors.textSecondary },
  addButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  errorText: { fontSize: 16, color: Colors.textError, textAlign: 'center' },
  retryButton: {
    marginTop: 16,
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary },
  emptyText: {
    textAlign: 'center',
    color: Colors.textMuted,
    marginTop: 40,
    fontSize: 16,
  },
});
