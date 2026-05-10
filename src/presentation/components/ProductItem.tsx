import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import type { Product } from '../../domain/model/Product';
import { Colors } from '../../constants/colors';

interface Props {
  product: Product;
  onPress: (product: Product) => void;
}

/**
 * Renders a single product row in the product list.
 * Tapping the row navigates to the product detail screen.
 */
export const ProductItem: React.FC<Props> = ({ product, onPress }) => (
  <TouchableOpacity
    style={styles.container}
    onPress={() => onPress(product)}
    activeOpacity={0.7}
  >
    <Image
      source={{ uri: product.logo }}
      style={styles.logo}
      resizeMode="contain"
    />
    <View style={styles.info}>
      <Text style={styles.name} numberOfLines={1}>
        {product.name}
      </Text>
      <Text style={styles.id}>ID: {product.id}</Text>
    </View>
    <Text style={styles.arrow}>›</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 8,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 2,
    elevation: 2,
  },
  logo: {
    width: 48,
    height: 48,
    borderRadius: 4,
    backgroundColor: Colors.border,
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  id: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  arrow: {
    fontSize: 24,
    color: Colors.textSecondary,
    marginLeft: 8,
  },
});
