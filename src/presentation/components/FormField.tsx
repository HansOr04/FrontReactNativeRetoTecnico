import React, { useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  type KeyboardTypeOptions,
} from 'react-native';
import { Colors } from '../../constants/colors';

interface Props {
  label: string;
  value: string;
  onChangeText?: (text: string) => void;
  errorMessage?: string | null;
  isDisabled?: boolean;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
  multiline?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoCorrect?: boolean;
  hint?: string;
}

/**
 * Campo de formulario con label, input y mensaje de error.
 * Implementa el diseño de validación del PDF:
 * - Borde rojo cuando hay error
 * - Mensaje de error en rojo debajo del campo
 * - Soporte para campos deshabilitados (ID en modo edición)
 *
 * Diseño basado en D2: label arriba, input con borde, error en rojo debajo.
 */
export const FormField: React.FC<Props> = ({
  label,
  value,
  onChangeText,
  errorMessage,
  isDisabled = false,
  placeholder,
  keyboardType,
  multiline,
  autoCapitalize,
  autoCorrect,
  hint,
}) => {
  const inputStyle = useMemo(
    () => [
      styles.input,
      errorMessage ? styles.inputError : null,
      isDisabled ? styles.inputDisabled : null,
    ],
    [errorMessage, isDisabled],
  );

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={inputStyle}
        value={value}
        onChangeText={onChangeText}
        editable={!isDisabled}
        placeholder={placeholder}
        placeholderTextColor={Colors.textMuted}
        keyboardType={keyboardType}
        multiline={multiline}
        autoCapitalize={autoCapitalize}
        autoCorrect={autoCorrect}
      />
      {errorMessage ? (
        <Text style={styles.errorText}>{errorMessage}</Text>
      ) : null}
      {!errorMessage && hint ? (
        <Text style={styles.hintText}>{hint}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.borderDefault,
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: Colors.textPrimary,
    backgroundColor: Colors.backgroundPrimary,
  },
  inputError: {
    borderColor: Colors.borderError,
  },
  inputDisabled: {
    backgroundColor: '#F5F5F5',
    color: Colors.textMuted,
  },
  errorText: {
    fontSize: 13,
    color: Colors.textError,
    marginTop: 4,
  },
  hintText: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 4,
  },
});
