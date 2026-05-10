import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useProducts } from '../application/hooks/useProducts';
import type { IProductRepository } from '../domain/repository/IProductRepository';
import type { Product } from '../domain/model/Product';

const makeProduct = (overrides: Partial<Product> = {}): Product => ({
  id: 'tdc-001',
  name: 'Tarjeta de Crédito',
  description: 'Tarjeta con beneficios exclusivos',
  logo: 'https://example.com/logo.png',
  date_release: '2025-01-01',
  date_revision: '2026-01-01',
  ...overrides,
});

const mockRepository = (
  products: Product[] = [],
): jest.Mocked<Pick<IProductRepository, 'getAll' | 'delete'>> => ({
  getAll: jest.fn().mockResolvedValue(products),
  delete: jest.fn().mockResolvedValue(undefined),
});

const TWO_PRODUCTS = [
  makeProduct({ id: 'tdc-001', name: 'Tarjeta de Crédito' }),
  makeProduct({ id: 'deb-001', name: 'Tarjeta de Débito' }),
];

describe('useProducts — estado inicial', () => {
  it('should start in loading state', () => {
    const repo = mockRepository(TWO_PRODUCTS);
    const { result } = renderHook(() =>
      useProducts(repo as unknown as IProductRepository),
    );
    expect(result.current.isLoading).toBe(true);
  });

  it('should not be deleting initially', () => {
    const repo = mockRepository();
    const { result } = renderHook(() =>
      useProducts(repo as unknown as IProductRepository),
    );
    expect(result.current.isDeleting).toBe(false);
  });

  it('should have no error initially', () => {
    const repo = mockRepository();
    const { result } = renderHook(() =>
      useProducts(repo as unknown as IProductRepository),
    );
    expect(result.current.error).toBeNull();
  });
});

describe('useProducts — carga de productos', () => {
  it('should load products on mount', async () => {
    const repo = mockRepository(TWO_PRODUCTS);
    const { result } = renderHook(() =>
      useProducts(repo as unknown as IProductRepository),
    );
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.filteredProducts.length).toBe(2);
    expect(repo.getAll).toHaveBeenCalledTimes(1);
  });

  it('should set error when getAll fails', async () => {
    const repo = mockRepository();
    repo.getAll.mockRejectedValueOnce(new Error('Timeout de red'));
    const { result } = renderHook(() =>
      useProducts(repo as unknown as IProductRepository),
    );
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.error).toBe('Timeout de red');
    expect(result.current.filteredProducts.length).toBe(0);
  });
});

describe('useProducts — búsqueda', () => {
  it('should filter by name (case-insensitive)', async () => {
    const repo = mockRepository(TWO_PRODUCTS);
    const { result } = renderHook(() =>
      useProducts(repo as unknown as IProductRepository),
    );
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => { result.current.setSearchQuery('crédito'); });

    expect(result.current.filteredProducts.length).toBe(1);
    expect(result.current.filteredProducts[0].id).toBe('tdc-001');
  });

  it('should filter by id', async () => {
    const repo = mockRepository(TWO_PRODUCTS);
    const { result } = renderHook(() =>
      useProducts(repo as unknown as IProductRepository),
    );
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => { result.current.setSearchQuery('deb-001'); });

    expect(result.current.filteredProducts.length).toBe(1);
    expect(result.current.filteredProducts[0].id).toBe('deb-001');
  });

  it('should return empty array when search matches nothing', async () => {
    const repo = mockRepository(TWO_PRODUCTS);
    const { result } = renderHook(() =>
      useProducts(repo as unknown as IProductRepository),
    );
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => { result.current.setSearchQuery('xyz-no-match'); });

    expect(result.current.filteredProducts.length).toBe(0);
  });

  it('recordCount reflects filtered length', async () => {
    const repo = mockRepository(TWO_PRODUCTS);
    const { result } = renderHook(() =>
      useProducts(repo as unknown as IProductRepository),
    );
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => { result.current.setSearchQuery('Crédito'); });

    expect(result.current.recordCount).toBe(1);
  });
});

describe('useProducts — eliminación', () => {
  it('should return true and reload on successful delete', async () => {
    const repo = mockRepository(TWO_PRODUCTS);
    const { result } = renderHook(() =>
      useProducts(repo as unknown as IProductRepository),
    );
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    let success: boolean | undefined;
    await act(async () => {
      success = await result.current.deleteProduct('tdc-001');
    });

    expect(success).toBe(true);
    expect(repo.delete).toHaveBeenCalledWith('tdc-001');
    expect(repo.getAll).toHaveBeenCalledTimes(2); // mount + after delete
  });

  it('should return false and set error on failed delete', async () => {
    const repo = mockRepository(TWO_PRODUCTS);
    repo.delete.mockRejectedValueOnce(new Error('Producto no encontrado'));
    const { result } = renderHook(() =>
      useProducts(repo as unknown as IProductRepository),
    );
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    let success: boolean | undefined;
    await act(async () => {
      success = await result.current.deleteProduct('tdc-001');
    });

    expect(success).toBe(false);
    expect(result.current.error).toBe('Producto no encontrado');
  });
});
