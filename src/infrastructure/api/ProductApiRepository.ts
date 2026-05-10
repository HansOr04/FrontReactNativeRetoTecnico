import { apiClient } from './apiClient';
import type { IProductRepository } from '../../domain/repository/IProductRepository';
import type { Product } from '../../domain/model/Product';

/**
 * HTTP implementation of IProductRepository.
 * Communicates with the backend REST API at /bp/products.
 * Swap this class for any other implementation without touching
 * the application or presentation layers (DIP).
 */
export class ProductApiRepository implements IProductRepository {
  async getAll(): Promise<Product[]> {
    return apiClient.get<Product[]>('/products');
  }

  async create(product: Product): Promise<Product> {
    return apiClient.post<Product>('/products', product);
  }

  async update(id: string, product: Product): Promise<Product> {
    return apiClient.put<Product>(`/products/${id}`, product);
  }

  async delete(id: string): Promise<void> {
    return apiClient.delete(`/products/${id}`);
  }

  async verifyId(id: string): Promise<boolean> {
    return apiClient.get<boolean>(`/products/verification?id=${id}`);
  }
}
