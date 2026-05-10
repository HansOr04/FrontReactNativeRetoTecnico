/**
 * Application color palette.
 * Primary yellow matches the bank brand identity.
 * All values are `as const` to enable exhaustive type checking.
 */
export const Colors = {
  primary: '#FFDD00',
  primaryDark: '#E6C800',
  secondary: '#1A1A2E',
  background: '#F5F5F5',
  surface: '#FFFFFF',
  text: '#1A1A2E',
  textSecondary: '#6B7280',
  textLight: '#FFFFFF',
  border: '#E5E7EB',
  error: '#EF4444',
  success: '#22C55E',
  warning: '#F59E0B',
  danger: '#DC2626',
  shadow: '#00000020',
} as const;

export type ColorKey = keyof typeof Colors;
