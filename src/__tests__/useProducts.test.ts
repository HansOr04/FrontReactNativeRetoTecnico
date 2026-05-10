import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useProducts } from '../application/hooks/useProducts';

jest.mock('../infrastructure/api/ProductApiRepository', () => ({
  ProductApiRepository: jest.fn().mockImplementation(() => ({
    getAll: jest.fn().mockResolvedValue([
      {
        id: 'tdc-001',
        name: 'Tarjeta de Crédito',
        description: 'Tarjeta de crédito con beneficios exclusivos para clientes',
        logo: 'https://example.com/logo.png',
        date_release: '2025-01-01',
        date_revision: '2026-01-01',
      },
      {
        id: 'deb-001',
        name: 'Tarjeta de Débito',
        description: 'Tarjeta de débito para retiros y compras en línea',
        logo: 'https://example.com/debit.png',
        date_release: '2025-03-01',
        date_revision: '2026-03-01',
      },
    ]),
    delete: jest.fn().mockResolvedValue(undefined),
  })),
}));

describe('useProducts', () => {
  it('should start in loading state', () => {
    const { result } = renderHook(() => useProducts());
    expect(result.current.loading).toBe(true);
  });

  it('should load products on mount', async () => {
    const { result } = renderHook(() => useProducts());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.products.length).toBe(2);
  });

  it('should expose the correct totalCount (unfiltered)', async () => {
    const { result } = renderHook(() => useProducts());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.totalCount).toBe(2);
  });

  it('should filter products by name when searchQuery is set', async () => {
    const { result } = renderHook(() => useProducts());
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.setSearchQuery('Crédito');
    });

    expect(result.current.products.length).toBe(1);
    expect(result.current.products[0].id).toBe('tdc-001');
    expect(result.current.totalCount).toBe(2); // totalCount remains unfiltered
  });

  it('should return empty array when search matches nothing', async () => {
    const { result } = renderHook(() => useProducts());
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.setSearchQuery('xyz-no-match');
    });

    expect(result.current.products.length).toBe(0);
  });

  it('should remove a product from the list after deleteProduct', async () => {
    const { result } = renderHook(() => useProducts());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.deleteProduct('tdc-001');
    });

    expect(result.current.products.find((p: { id: string }) => p.id === 'tdc-001')).toBeUndefined();
  });
});
