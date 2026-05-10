import React from 'react';
import { TextInput, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';

interface Props {
  /** Texto actual del campo de búsqueda. */
  value: string;
  /** Callback invocado en cada cambio de texto. */
  onChangeText: (text: string) => void;
  /** Texto de placeholder; por defecto "Search..." */
  placeholder?: string;
}

/**
 * Campo de búsqueda de productos financieros.
 * Diseño basado en D1/D3: campo con borde, placeholder "Search..."
 */
export const SearchBar: React.FC<Props> = ({
  value,
  onChangeText,
  placeholder = 'Search...',
}) => (
  <TextInput
    style={styles.input}
    value={value}
    onChangeText={onChangeText}
    placeholder={placeholder}
    placeholderTextColor={Colors.textMuted}
    clearButtonMode="while-editing"
    autoCorrect={false}
    autoCapitalize="none"
  />
);

const styles = StyleSheet.create({
  input: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: Colors.borderDefault,
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: Colors.textPrimary,
    backgroundColor: Colors.backgroundPrimary,
  },
});
