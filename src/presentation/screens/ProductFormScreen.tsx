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
import { FormField } from '../components/FormField';
import { Colors } from '../../constants/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'ProductForm'>;

/**
 * Form screen for creating a new product or editing an existing one.
 * All validation and submission logic lives in useProductForm.
 */
export const ProductFormScreen: React.FC<Props> = ({ route, navigation }) => {
  const existingProduct = route.params?.product;

  const { formData, errors, loading, submitError, updateField, reset, submit, isEditing } =
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
        error={errors.id}
        editable={!isEditing}
        placeholder="ej: tdc-001"
        autoCapitalize="none"
      />
      <FormField
        label="Nombre"
        value={formData.name}
        onChangeText={(v) => updateField('name', v)}
        error={errors.name}
        placeholder="ej: Tarjeta de Crédito"
      />
      <FormField
        label="Descripción"
        value={formData.description}
        onChangeText={(v) => updateField('description', v)}
        error={errors.description}
        placeholder="ej: Tarjeta de crédito con beneficios exclusivos"
        multiline
        numberOfLines={3}
      />
      <FormField
        label="Logo (URL)"
        value={formData.logo}
        onChangeText={(v) => updateField('logo', v)}
        error={errors.logo}
        placeholder="https://example.com/logo.png"
        autoCapitalize="none"
        keyboardType="url"
      />
      <FormField
        label="Fecha de Liberación"
        value={formData.date_release}
        onChangeText={(v) => updateField('date_release', v)}
        error={errors.date_release}
        placeholder="YYYY-MM-DD"
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
          <ActivityIndicator color={Colors.text} />
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
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 16 },
  submitError: {
    color: Colors.error,
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
  submitText: { fontSize: 16, fontWeight: '600', color: Colors.text },
  resetButton: {
    backgroundColor: Colors.surface,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  resetText: { fontSize: 16, fontWeight: '600', color: Colors.textSecondary },
  spacer: { height: 40 },
});
