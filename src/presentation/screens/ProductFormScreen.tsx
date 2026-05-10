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
import { productRepository } from '../../infrastructure/api/ProductApiRepository';
import type { FieldValidation } from '../../domain/model/Product';
import { FormField } from '../components/FormField';
import { Colors } from '../../constants/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'ProductForm'>;

/** Extrae el mensaje de error de un FieldValidation, o null si es válido. */
const fieldError = (v: FieldValidation): string | null =>
  v.isValid ? null : v.errorMessage;

/**
 * Pantalla de formulario para crear o editar un producto financiero.
 * Toda la lógica de validación y envío vive en useProductForm.
 */
export const ProductFormScreen: React.FC<Props> = ({ route, navigation }) => {
  const existingProduct = route.params?.product;

  const {
    formData,
    validationState,
    isSubmitting,
    submitError,
    isEditMode,
    updateField,
    submitForm,
    resetForm,
  } = useProductForm(productRepository, existingProduct);

  const handleSubmit = () =>
    submitForm((_product) => navigation.popToTop());

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
        errorMessage={fieldError(validationState.id)}
        isDisabled={isEditMode}
        placeholder="ej: tdc-001"
      />
      <FormField
        label="Nombre"
        value={formData.name}
        onChangeText={(v) => updateField('name', v)}
        errorMessage={fieldError(validationState.name)}
        placeholder="ej: Tarjeta de Crédito"
      />
      <FormField
        label="Descripción"
        value={formData.description}
        onChangeText={(v) => updateField('description', v)}
        errorMessage={fieldError(validationState.description)}
        placeholder="ej: Tarjeta de crédito con beneficios exclusivos"
        multiline
      />
      <FormField
        label="Logo (URL)"
        value={formData.logo}
        onChangeText={(v) => updateField('logo', v)}
        errorMessage={fieldError(validationState.logo)}
        placeholder="https://example.com/logo.png"
        keyboardType="url"
      />
      <FormField
        label="Fecha de Liberación"
        value={formData.date_release}
        onChangeText={(v) => updateField('date_release', v)}
        errorMessage={fieldError(validationState.date_release)}
        placeholder="YYYY-MM-DD"
      />
      <FormField
        label="Fecha de Revisión (auto-calculada)"
        value={formData.date_revision}
        isDisabled
        placeholder="Se calcula automáticamente"
      />

      {submitError ? (
        <Text style={styles.submitError}>{submitError}</Text>
      ) : null}

      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator color={Colors.textPrimary} />
        ) : (
          <Text style={styles.submitText}>
            {isEditMode ? 'Actualizar' : 'Agregar'}
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.resetButton}
        onPress={resetForm}
        disabled={isSubmitting}
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
