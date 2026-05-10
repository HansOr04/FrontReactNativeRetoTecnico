import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProductListScreen } from '../screens/ProductListScreen';
import { ProductDetailScreen } from '../screens/ProductDetailScreen';
import { ProductFormScreen } from '../screens/ProductFormScreen';
import type { Product } from '../../domain/model/Product';
import { Colors } from '../../constants/colors';

/**
 * Route parameter definitions for the entire navigation stack.
 * Import this type in screen components to get typed route params.
 */
export type RootStackParamList = {
  ProductList: undefined;
  ProductDetail: { product: Product };
  ProductForm: { product?: Product };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * Root navigation container and stack definition.
 * Rendered once at the app entry point.
 */
export const AppNavigator: React.FC = () => (
  <NavigationContainer>
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: Colors.headerBackground },
        headerTintColor: Colors.headerText,
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen
        name="ProductList"
        component={ProductListScreen}
        options={{ title: 'Banco App — Productos' }}
      />
      <Stack.Screen
        name="ProductDetail"
        component={ProductDetailScreen}
        options={{ title: 'Detalle del Producto' }}
      />
      <Stack.Screen
        name="ProductForm"
        component={ProductFormScreen}
        options={({ route }) => ({
          title: route.params?.product ? 'Editar Producto' : 'Agregar Producto',
        })}
      />
    </Stack.Navigator>
  </NavigationContainer>
);
