import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';

interface Props {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

/**
 * Search input for filtering the product list.
 * Stateless: all state is managed by the parent hook.
 */
export const SearchBar: React.FC<Props> = ({
  value,
  onChangeText,
  placeholder = 'Buscar...',
}) => (
  <View style={styles.container}>
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
  </View>
);

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  input: {
    backgroundColor: Colors.backgroundPrimary,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.borderDefault,
  },
});
