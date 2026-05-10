import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { Product } from '../../domain/model/Product';
import { Colors } from '../../constants/colors';

interface Props {
  /** Producto a mostrar en la fila. */
  product: Product;
  /** Callback invocado al pulsar la fila; recibe el producto completo. */
  onPress: (product: Product) => void;
}

/**
 * Ítem individual de la lista de productos financieros.
 * Diseño basado en D1: nombre en negrita, ID debajo en gris, chevron a la derecha.
 * Es un TouchableOpacity — toda la fila es tappable.
 */
export const ProductItem: React.FC<Props> = ({ product, onPress }) => (
  <TouchableOpacity
    style={styles.row}
    onPress={() => onPress(product)}
    activeOpacity={0.7}
  >
    <View style={styles.info}>
      <Text style={styles.name}>{product.name}</Text>
      <Text style={styles.id}>{`ID: ${product.id}`}</Text>
    </View>
    <Text style={styles.chevron}>{'>'}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.borderDefault,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  id: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  chevron: {
    fontSize: 18,
    color: Colors.chevronColor,
  },
});
