import React from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { useProductForm } from '../../application/hooks/useProductForm';
import type { FieldValidation } from '../../domain/model/Product';
import { FormField } from '../components/FormField';
import { Colors } from '../../constants/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'ProductForm'>;

/** Extracts the error message string from a FieldValidation or undefined if valid. */
const fieldError = (v: FieldValidation): string | undefined =>
  v.isValid ? undefined : v.errorMessage ?? undefined;

/**
 * Form screen for creating a new product or editing an existing one.
 * All validation and submission logic lives in useProductForm.
 */
export const ProductFormScreen: React.FC<Props> = ({ route, navigation }) => {
  const existingProduct = route.params?.product;

  const { formData, validation, loading, submitError, updateField, reset, submit, isEditing } =
    useProductForm(existingProduct, () => navigation.popToTop());

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <FormField
        label="ID"
        value={formData.id}
        onChangeText={(v) => updateField('id', v)}
        error={fieldError(validation.id)}
        editable={!isEditing}
        placeholder="ej: tdc-001"
        autoCapitalize="none"
      />
      <FormField
        label="Nombre"
        value={formData.name}
        onChangeText={(v) => updateField('name', v)}
        error={fieldError(validation.name)}
        placeholder="ej: Tarjeta de Crédito"
      />
      <FormField
        label="Descripción"
        value={formData.description}
        onChangeText={(v) => updateField('description', v)}
        error={fieldError(validation.description)}
        placeholder="ej: Tarjeta de crédito con beneficios exclusivos"
        multiline
        numberOfLines={3}
      />
      <FormField
        label="Logo (URL)"
        value={formData.logo}
        onChangeText={(v) => updateField('logo', v)}
        error={fieldError(validation.logo)}
        placeholder="https://example.com/logo.png"
        autoCapitalize="none"
        keyboardType="url"
      />
      <FormField
        label="Fecha de Liberación"
        value={formData.date_release}
        onChangeText={(v) => updateField('date_release', v)}
        error={fieldError(validation.date_release)}
        placeholder="YYYY-MM-DD"
      />
      <FormField
        label="Fecha de Revisión (auto-calculada)"
        value={formData.date_revision}
        onChangeText={() => undefined}
        editable={false}
        placeholder="Se calcula automáticamente"
      />

      {submitError ? (
        <Text style={styles.submitError}>{submitError}</Text>
      ) : null}

      <TouchableOpacity
        style={styles.submitButton}
        onPress={submit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={Colors.textPrimary} />
        ) : (
          <Text style={styles.submitText}>
            {isEditing ? 'Actualizar' : 'Agregar'}
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.resetButton}
        onPress={reset}
        disabled={loading}
      >
        <Text style={styles.resetText}>Reiniciar</Text>
      </TouchableOpacity>

      <View style={styles.spacer} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.backgroundSecondary },
  content: { padding: 16 },
  submitError: {
    color: Colors.textError,
    fontSize: 14,
    marginBottom: 12,
    textAlign: 'center',
  },
  submitButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  submitText: { fontSize: 16, fontWeight: '600', color: Colors.textPrimary },
  resetButton: {
    backgroundColor: Colors.buttonSecondaryBackground,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.borderDefault,
  },
  resetText: { fontSize: 16, fontWeight: '600', color: Colors.buttonSecondaryText },
  spacer: { height: 40 },
});
