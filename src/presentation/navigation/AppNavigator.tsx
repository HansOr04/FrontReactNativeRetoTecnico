import React from 'react';
import { Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProductListScreen } from '../screens/ProductListScreen';
import { ProductDetailScreen } from '../screens/ProductDetailScreen';
import { ProductFormScreen } from '../screens/ProductFormScreen';
import type { Product } from '../../domain/model/Product';
import { Colors } from '../../constants/colors';

/**
 * Mapa de rutas y sus parámetros tipados.
 * undefined significa que la ruta no recibe parámetros.
 */
export type RootStackParamList = {
  ProductList: undefined;
  ProductDetail: { product: Product };
  ProductForm: { product?: Product }; // undefined = modo creación, Product = modo edición
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

const Stack = createNativeStackNavigator<RootStackParamList>();

/** Título estándar del banco mostrado en la pantalla raíz. */
const BankTitle: React.FC = () => (
  <Text style={{ fontSize: 18, fontWeight: '500', color: Colors.textPrimary }}>
    {'🏦 BANCO'}
  </Text>
);

/**
 * Contenedor de navegación raíz de la aplicación.
 *
 * Estructura de rutas:
 * - ProductList   → listado y búsqueda de productos (pantalla raíz, sin back)
 * - ProductDetail → detalle de un producto; recibe { product } por parámetro
 * - ProductForm   → formulario de creación/edición; { product } opcional:
 *                   ausente = modo creación, presente = modo edición
 *
 * Renderizado una sola vez en App.tsx dentro de GestureHandlerRootView.
 */
export const AppNavigator: React.FC = () => (
  <NavigationContainer>
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: Colors.headerBackground },
        headerTitleStyle: { fontWeight: '500', color: Colors.textPrimary },
        headerTintColor: Colors.primary,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="ProductList"
        component={ProductListScreen}
        options={{
          headerTitle: () => <BankTitle />,
          headerBackVisible: false,
        }}
      />
      <Stack.Screen
        name="ProductDetail"
        component={ProductDetailScreen}
        options={({ route }) => ({ title: route.params.product.name })}
      />
      <Stack.Screen
        name="ProductForm"
        component={ProductFormScreen}
        options={({ route }) => ({
          title: route.params?.product ? 'Editar' : 'Agregar',
        })}
      />
    </Stack.Navigator>
  </NavigationContainer>
);
