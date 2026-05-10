import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  StyleSheet,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import type { Product } from '../../domain/model/Product';
import { useProducts } from '../../application/hooks/useProducts';
import { ProductItem } from '../components/ProductItem';
import { SearchBar } from '../components/SearchBar';
import { Colors } from '../../constants/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'ProductList'>;

// ─── Skeleton ─────────────────────────────────────────────────────────────────

/**
 * Rectángulo animado que simula una fila de la lista durante la carga inicial.
 * Pulsa entre opacidad 0.3 y 1 usando Animated.loop.
 */
const SkeletonItem: React.FC = () => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ]),
    );
    anim.start();
    return () => { anim.stop(); };
  }, [opacity]);

  return (
    <Animated.View style={[styles.skeletonRow, { opacity }]}>
      <View style={styles.skeletonTitle} />
      <View style={styles.skeletonSubtitle} />
    </Animated.View>
  );
};

const SKELETON_KEYS = ['sk-1', 'sk-2', 'sk-3', 'sk-4', 'sk-5'];

// ─── Separator ────────────────────────────────────────────────────────────────

/** El separador visual está en ProductItem (borderBottomWidth); este nodo es inerte. */
const Separator: React.FC = () => <View style={styles.separator} />;

// ─── Screen ───────────────────────────────────────────────────────────────────

/**
 * Pantalla principal del sistema bancario.
 * Muestra la lista de productos financieros con búsqueda en tiempo real
 * y contador de registros. Punto de entrada a las demás pantallas.
 *
 * Funcionalidades implementadas: F1, F2, F3, F4
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

  // ── Error state ────────────────────────────────────────────────────────────
  if (error) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadProducts}>
          <Text style={styles.retryText}>Reintentar</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // ── Normal / loading state ─────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container}>
      {/* F2 — Búsqueda en tiempo real, filtrado local sin debounce */}
      <SearchBar value={searchQuery} onChangeText={setSearchQuery} />

      {/* F1 — Lista de productos o skeleton durante la carga inicial */}
      {isLoading ? (
        <View style={styles.flex}>
          {SKELETON_KEYS.map((k) => <SkeletonItem key={k} />)}
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ProductItem product={item} onPress={handlePress} />
          )}
          ItemSeparatorComponent={Separator}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No se encontraron productos</Text>
          }
          style={styles.flex}
        />
      )}

      {/* F3 — Contador de registros filtrados */}
      <Text style={styles.countText}>{`${recordCount} registros`}</Text>

      {/* F4 — Botón Agregar */}
      <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
        <Text style={styles.addButtonText}>Agregar</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundSecondary,
  },
  flex: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: Colors.backgroundSecondary,
  },
  separator: {
    height: 0,
  },
  emptyText: {
    textAlign: 'center',
    color: Colors.textMuted,
    marginTop: 40,
    fontSize: 15,
  },
  countText: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    padding: 8,
  },
  addButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 16,
    margin: 16,
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  errorText: {
    fontSize: 16,
    color: Colors.textError,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  skeletonRow: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.borderDefault,
  },
  skeletonTitle: {
    height: 16,
    borderRadius: 4,
    backgroundColor: Colors.borderDefault,
    width: '60%',
  },
  skeletonSubtitle: {
    height: 12,
    borderRadius: 4,
    backgroundColor: Colors.borderDefault,
    width: '30%',
    marginTop: 8,
  },
});
