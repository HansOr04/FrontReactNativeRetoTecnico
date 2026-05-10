/**
 * Paleta de colores oficial del diseño bancario.
 * Centralizar aquí evita strings de color dispersos en los componentes.
 * Todos los colores deben tomarse de este archivo — sin hardcoding en StyleSheet.
 */
export const Colors = {
  // Colores primarios del banco
  primary: '#FFD700',        // Amarillo banco — botón principal Agregar/Enviar
  primaryText: '#CC9900',    // Texto sobre fondo amarillo

  // Acciones destructivas
  danger: '#E02020',         // Botón Eliminar

  // Texto
  textPrimary: '#1A1A1A',
  textSecondary: '#666666',
  textMuted: '#999999',
  textError: '#E02020',      // Mensajes de error de validación

  // Fondos
  backgroundPrimary: '#FFFFFF',
  backgroundSecondary: '#F5F5F5',

  // Bordes
  borderDefault: '#E0E0E0',
  borderError: '#E02020',    // Borde rojo en campo con error
  borderFocus: '#FFD700',

  // Header
  headerBackground: '#FFFFFF',
  headerText: '#1A1A1A',
  headerAccent: '#FFD700',   // Color del ícono del banco en el header

  // Navegación
  chevronColor: '#CCCCCC',

  // Botones secundarios
  buttonSecondaryBackground: '#F0F0F0',
  buttonSecondaryText: '#333333',
} as const;

export type ColorKey = keyof typeof Colors;
