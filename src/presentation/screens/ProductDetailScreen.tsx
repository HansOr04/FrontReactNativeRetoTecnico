import React, { useLayoutEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Modal,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { productRepository } from '../../infrastructure/api/ProductApiRepository';
import { Colors } from '../../constants/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'ProductDetail'>;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Convierte "2024-01-15" a "15/01/2024" para mostrar al usuario. */
function formatDate(dateString: string): string {
  const parts = dateString.split('-');
  if (parts.length !== 3) return dateString;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface InfoRowProps {
  label: string;
  value: string;
  bold?: boolean;
}

/** Fila de información con label a la izquierda y valor a la derecha. */
const InfoRow: React.FC<InfoRowProps> = ({ label, value, bold = false }) => (
  <View style={styles.row}>
    <Text style={styles.rowLabel}>{label}</Text>
    <Text style={[styles.rowValue, bold ? styles.rowValueBold : null]}>{value}</Text>
  </View>
);

// ─── Screen ───────────────────────────────────────────────────────────────────

/**
 * Pantalla de detalle de un producto financiero.
 * Muestra toda la información del producto y permite editarlo o eliminarlo.
 *
 * Funcionalidades implementadas: F1 (detalle), F5 (editar), F6 (eliminar)
 */
export const ProductDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { product } = route.params;

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [logoError, setLogoError] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({ title: product.name });
  }, [navigation, product.name]);

  /**
   * Llama al repositorio directamente para eliminar el producto.
   * Si tiene éxito navega a ProductList para mostrar la lista actualizada.
   * Si falla, expone el error en el propio modal sin cerrarlo.
   */
  const handleDelete = async () => {
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await productRepository.delete(product.id);
      setShowDeleteModal(false);
      navigation.navigate('ProductList');
    } catch (err) {
      setDeleteError(
        err instanceof Error ? err.message : 'No se pudo eliminar el producto',
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        {/* Encabezado de identificación */}
        <Text style={styles.productId}>{`ID: ${product.id}`}</Text>
        <Text style={styles.infoSubtitle}>Información extra</Text>

        <View style={styles.separator} />

        {/* Filas de datos */}
        <InfoRow label="Nombre" value={product.name} bold />
        <InfoRow label="Descripción" value={product.description} />

        {/* Logo con fallback ante error de carga */}
        <Text style={styles.sectionLabel}>Logo</Text>
        {logoError ? (
          <View style={styles.logoFallback}>
            <Text style={styles.logoFallbackText}>Logo no disponible</Text>
          </View>
        ) : (
          <Image
            source={{ uri: product.logo }}
            style={styles.logo}
            resizeMode="contain"
            onError={() => setLogoError(true)}
          />
        )}

        <InfoRow label="Fecha liberación" value={formatDate(product.date_release)} />
        <InfoRow label="Fecha revisión" value={formatDate(product.date_revision)} />

        {/* F5 — Botón Editar */}
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => navigation.navigate('ProductForm', { product })}
        >
          <Text style={styles.editButtonText}>Editar</Text>
        </TouchableOpacity>

        {/* F6 — Botón que abre el modal de eliminación */}
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => { setDeleteError(null); setShowDeleteModal(true); }}
        >
          <Text style={styles.deleteButtonText}>Eliminar</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* F6 — Modal de confirmación de eliminación (D4) */}
      <Modal
        visible={showDeleteModal}
        transparent
        animationType="slide"
        onRequestClose={() => { if (!isDeleting) setShowDeleteModal(false); }}
      >
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowDeleteModal(false)}
              disabled={isDeleting}
            >
              <Text style={styles.closeButtonText}>{'×'}</Text>
            </TouchableOpacity>

            <Text style={styles.modalText}>
              {`¿Estás seguro de eliminar el producto ${product.name}?`}
            </Text>

            {deleteError ? (
              <Text style={styles.deleteErrorText}>{deleteError}</Text>
            ) : null}

            {isDeleting ? (
              <ActivityIndicator
                size="large"
                color={Colors.primary}
                style={styles.spinner}
              />
            ) : (
              <>
                <TouchableOpacity
                  style={styles.confirmButton}
                  onPress={handleDelete}
                >
                  <Text style={styles.confirmButtonText}>Confirmar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setShowDeleteModal(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundSecondary,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  productId: {
    fontSize: 22,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  infoSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.borderDefault,
    marginVertical: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.borderDefault,
  },
  rowLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    flex: 1,
  },
  rowValue: {
    fontSize: 14,
    color: Colors.textPrimary,
    flex: 2,
    textAlign: 'right',
  },
  rowValueBold: {
    fontWeight: '600',
  },
  sectionLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 10,
    marginBottom: 8,
  },
  logo: {
    width: 200,
    height: 100,
    alignSelf: 'center',
    marginBottom: 4,
  },
  logoFallback: {
    width: 200,
    height: 100,
    alignSelf: 'center',
    backgroundColor: Colors.borderDefault,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  logoFallbackText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  editButton: {
    backgroundColor: Colors.backgroundPrimary,
    borderWidth: 1,
    borderColor: Colors.borderDefault,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 12,
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  deleteButton: {
    backgroundColor: Colors.danger,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.backgroundPrimary,
  },
  // ── Modal ──────────────────────────────────────────────────────────────────
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: Colors.backgroundPrimary,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 24,
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 4,
  },
  closeButtonText: {
    fontSize: 24,
    lineHeight: 24,
    color: Colors.textSecondary,
  },
  modalText: {
    fontSize: 16,
    textAlign: 'center',
    color: Colors.textPrimary,
    marginVertical: 16,
  },
  spinner: {
    marginVertical: 24,
  },
  confirmButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  cancelButton: {
    backgroundColor: Colors.buttonSecondaryBackground,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.buttonSecondaryText,
  },
  deleteErrorText: {
    fontSize: 13,
    color: Colors.textError,
    textAlign: 'center',
    marginBottom: 8,
  },
});
