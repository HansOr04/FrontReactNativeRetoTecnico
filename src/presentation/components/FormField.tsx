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
  /** Etiqueta visible encima del campo. */
  label: string;
  /** Valor actual del campo. */
  value: string;
  /** Callback de cambio de texto. Omitir en campos de solo lectura. */
  onChangeText?: (text: string) => void;
  /** Mensaje de error; cuando no es null/undefined/'' muestra texto rojo debajo del input. */
  errorMessage?: string | null;
  /** Cuando true, el campo no es editable (ej: ID en modo edición). */
  isDisabled?: boolean;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
  multiline?: boolean;
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
      />
      {errorMessage ? (
        <Text style={styles.errorText}>{errorMessage}</Text>
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
});
