import { apiClient } from './apiClient';
import type { IProductRepository } from '../../domain/repository/IProductRepository';
import type { Product, ProductFormData } from '../../domain/model/Product';

/**
 * Implementación HTTP del repositorio de productos financieros.
 * Consume la API del backend Node.js corriendo en localhost:3002.
 *
 * Implementa IProductRepository — la capa de aplicación solo
 * conoce la interfaz, no esta implementación concreta (DIP).
 */
export class ProductApiRepository implements IProductRepository {
  /**
   * Obtiene todos los productos. El backend retorna { data: Product[] }.
   */
  async getAll(): Promise<Product[]> {
    const response = await apiClient.get<{ data: Product[] }>('/products');
    return response.data;
  }

  /**
   * Crea un producto. El backend retorna { message: string, data: Product }.
   */
  async create(product: ProductFormData): Promise<Product> {
    const response = await apiClient.post<{ message: string; data: Product }>(
      '/products',
      product,
    );
    return response.data;
  }

  /**
   * Actualiza un producto. El ID no se envía en el body — va en la URL.
   */
  async update(id: string, product: Omit<ProductFormData, 'id'>): Promise<Product> {
    const response = await apiClient.put<{ message: string; data: Product }>(
      `/products/${id}`,
      product,
    );
    return response.data;
  }

  /**
   * Elimina un producto. El backend retorna { message: string }.
   */
  async delete(id: string): Promise<void> {
    await apiClient.delete<{ message: string }>(`/products/${id}`);
  }

  /**
   * Verifica si un ID existe. El backend retorna true o false directamente.
   */
  async verifyId(id: string): Promise<boolean> {
    return apiClient.get<boolean>(`/products/verification/${id}`);
  }
}

/** Instancia singleton — compartida por todos los hooks de la aplicación. */
export const productRepository = new ProductApiRepository();
