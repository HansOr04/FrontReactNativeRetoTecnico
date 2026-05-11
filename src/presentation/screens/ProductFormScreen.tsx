import React, { useLayoutEffect, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
  StyleSheet,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { useProductForm } from '../../application/hooks/useProductForm';
import { productRepository } from '../../infrastructure/api/ProductApiRepository';
import { FormField } from '../components/FormField';
import { Colors } from '../../constants/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'ProductForm'>;

/**
 * Formulario de registro y edición de productos financieros.
 * En modo creación: todos los campos editables, ID verificado contra la API.
 * En modo edición: ID deshabilitado, resto de campos editables.
 *
 * Funcionalidades implementadas: F4 (crear), F5 (editar)
 * Diseño basado en D2 (formulario) y D3 (lista con botón Agregar)
 */
const formatIdInput = (text: string): string => {
  const clean = text.toLowerCase().replaceAll(/[^a-z0-9]/g, '').slice(0, 9);
  if (clean.length <= 3) return clean;
  return `${clean.slice(0, 3)}-${clean.slice(3)}`;
};

const formatDateInput = (text: string): string => {
  const digits = text.replaceAll(/\D/g, '').slice(0, 8);
  if (digits.length <= 4) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 4)}-${digits.slice(4)}`;
  return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6)}`;
};

export const ProductFormScreen: React.FC<Props> = ({ route, navigation }) => {
  const { product } = route.params ?? {};
  const isEditMode = product !== undefined;

  const hook = useProductForm(productRepository, product);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: isEditMode ? 'Editar' : 'Formulario de Registro',
    });
  }, [navigation, isEditMode]);

  useEffect(() => {
    if (hook.submitError) {
      Alert.alert('No se pudo guardar', hook.submitError, [{ text: 'Entendido' }]);
    }
  }, [hook.submitError]);

  const handleSubmit = () => {
    void hook.submitForm((_saved) => {
      Alert.alert(
        'Éxito',
        `Producto ${isEditMode ? 'actualizado' : 'creado'} correctamente`,
        [{ text: 'OK', onPress: () => navigation.navigate('ProductList') }],
      );
    });
  };

  // ── Private render: action buttons ────────────────────────────────────────
  // Extracted because the conditional (spinner vs two buttons) exceeds 20 lines.
  const renderButtons = () => {
    if (hook.isSubmitting) {
      return (
        <ActivityIndicator
          size="large"
          color={Colors.primary}
          style={styles.spinner}
        />
      );
    }
    return (
      <>
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>
            {isEditMode ? 'Actualizar' : 'Enviar'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.resetButton}
          onPress={hook.resetForm}
        >
          <Text style={styles.resetButtonText}>Reiniciar</Text>
        </TouchableOpacity>
      </>
    );
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {!isEditMode && (
          <Text style={styles.title}>Formulario de Registro</Text>
        )}

        <FormField
          label="ID"
          value={hook.formData.id}
          onChangeText={(text) => hook.updateField('id', formatIdInput(text))}
          errorMessage={hook.validationState.id.errorMessage}
          isDisabled={isEditMode}
          placeholder="ej: tdc-001"
          autoCapitalize="none"
          autoCorrect={false}
          hint="Formato: 3 letras, guión y hasta 6 caracteres (ej: trj-crd)"
        />

        <FormField
          label="Nombre"
          value={hook.formData.name}
          onChangeText={(text) => hook.updateField('name', text)}
          errorMessage={hook.validationState.name.errorMessage}
          placeholder="ej: Tarjeta de Crédito"
        />

        <FormField
          label="Descripción"
          value={hook.formData.description}
          onChangeText={(text) => hook.updateField('description', text)}
          errorMessage={hook.validationState.description.errorMessage}
          placeholder="ej: Tarjeta de crédito con beneficios exclusivos"
          multiline
        />

        <FormField
          label="Logo"
          value={hook.formData.logo}
          onChangeText={(text) => hook.updateField('logo', text)}
          errorMessage={hook.validationState.logo.errorMessage}
          placeholder="https://..."
          keyboardType="url"
        />
        {hook.formData.logo ? (
          <Image
            source={{ uri: hook.formData.logo }}
            style={styles.logoPreview}
            resizeMode="contain"
          />
        ) : null}

        <FormField
          label="Fecha Liberación"
          value={hook.formData.date_release}
          onChangeText={(text) => hook.updateField('date_release', formatDateInput(text))}
          errorMessage={hook.validationState.date_release.errorMessage}
          placeholder="YYYYMMDD"
          keyboardType="numeric"
          hint="Escribe los números y el formato se aplica solo"
        />

        <FormField
          label="Fecha Revisión (auto-calculada)"
          value={hook.formData.date_revision}
          errorMessage={hook.validationState.date_revision.errorMessage}
          isDisabled
          placeholder="Se calcula automáticamente"
        />

        {renderButtons()}

        <View style={styles.spacer} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// ── Styles ─────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundSecondary,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 24,
  },
  logoPreview: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    backgroundColor: Colors.backgroundPrimary,
    marginTop: -8,
    marginBottom: 16,
  },
  submitError: {
    color: Colors.textError,
    fontSize: 14,
    textAlign: 'center',
    margin: 8,
  },
  spinner: {
    marginVertical: 16,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  resetButton: {
    backgroundColor: Colors.buttonSecondaryBackground,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.borderDefault,
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.buttonSecondaryText,
  },
  spacer: {
    height: 40,
  },
});
