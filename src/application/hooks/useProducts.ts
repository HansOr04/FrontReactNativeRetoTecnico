import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Product } from '../../domain/model/Product';
import type { IProductRepository } from '../../domain/repository/IProductRepository';
import { productRepository } from '../../infrastructure/api/ProductApiRepository';

const ERROR_LOAD = 'No se pudieron cargar los productos. Intente de nuevo.';
const ERROR_DELETE = 'No se pudo eliminar el producto. Intente de nuevo.';

/**
 * Hook de aplicación para la gestión de la lista de productos financieros.
 *
 * Responsabilidades:
 * - Cargar productos desde el repositorio al montar
 * - Filtrar productos por búsqueda de texto (nombre o id)
 * - Exponer la cantidad de registros visibles
 * - Gestionar el estado de carga y error para feedback visual
 * - Proveer la función de eliminación con manejo de errores
 *
 * @param repository - Repositorio de productos (inyectado para testabilidad)
 */
export const useProducts = (
  repository: IProductRepository = productRepository,
) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filteredProducts = useMemo(
    () =>
      products.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.id.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    [products, searchQuery],
  );

  const recordCount = filteredProducts.length;

  /** Carga todos los productos desde el repositorio y actualiza el estado. */
  const loadProducts = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await repository.getAll();
      setProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : ERROR_LOAD);
    } finally {
      setIsLoading(false);
    }
  }, [repository]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  /**
   * Elimina un producto por ID y recarga la lista.
   * @returns true si la eliminación fue exitosa, false si hubo un error.
   */
  const deleteProduct = useCallback(
    async (id: string): Promise<boolean> => {
      setIsDeleting(true);
      try {
        await repository.delete(id);
        await loadProducts();
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : ERROR_DELETE);
        return false;
      } finally {
        setIsDeleting(false);
      }
    },
    [repository, loadProducts],
  );

  return {
    filteredProducts,
    recordCount,
    searchQuery,
    isLoading,
    isDeleting,
    error,
    setSearchQuery,
    deleteProduct,
    loadProducts,
  };
};
