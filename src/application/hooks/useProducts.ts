import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Product } from '../../domain/model/Product';
import type { IProductRepository } from '../../domain/repository/IProductRepository';
import { ProductApiRepository } from '../../infrastructure/api/ProductApiRepository';

const repository: IProductRepository = new ProductApiRepository();

/**
 * Manages the product list, search filtering, refresh, and deletion.
 *
 * Business rules encapsulated here:
 * - Search matches against both name and description (case-insensitive).
 * - totalCount always reflects the unfiltered list length.
 * - Optimistic deletion removes the item from local state immediately.
 *
 * @returns Products list, loading/error state, search controls, and action handlers.
 */
export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await repository.getAll();
      setProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar productos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const filteredProducts = useMemo(
    () =>
      products.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    [products, searchQuery],
  );

  const deleteProduct = useCallback(async (id: string) => {
    await repository.delete(id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }, []);

  return {
    products: filteredProducts,
    totalCount: products.length,
    searchQuery,
    setSearchQuery,
    loading,
    error,
    refresh: fetchProducts,
    deleteProduct,
  };
};
