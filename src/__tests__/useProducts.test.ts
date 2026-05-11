import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useProducts } from '../application/hooks/useProducts';
import type { IProductRepository } from '../domain/repository/IProductRepository';
import type { Product } from '../domain/model/Product';

// ─── Test data ────────────────────────────────────────────────────────────────

const mockProducts: Product[] = [
  {
    id: 'trj-crd',
    name: 'Tarjetas de Crédito',
    description: 'Tarjeta de consumo bajo la modalidad de crédito',
    logo: 'https://www.visa.com.ec/logo.png',
    date_release: '2024-01-01',
    date_revision: '2025-01-01',
  },
  {
    id: 'cta-aho',
    name: 'Cuenta de Ahorros',
    description: 'Cuenta para depositar y ahorrar dinero de forma segura',
    logo: 'https://example.com/savings.png',
    date_release: '2024-02-01',
    date_revision: '2025-02-01',
  },
];

// ─── Mock repository ──────────────────────────────────────────────────────────

const mockRepository: jest.Mocked<IProductRepository> = {
  getAll: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  verifyId: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('useProducts', () => {
  it('loadProducts_exitoso_setaProductosEnEstado', async () => {
    // Arrange
    mockRepository.getAll.mockResolvedValue(mockProducts);

    // Act
    const { result } = renderHook(() => useProducts(mockRepository));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // Assert
    expect(result.current.filteredProducts.length).toBe(2);
  });

  it('loadProducts_error_setaMensajeDeError', async () => {
    // Arrange
    mockRepository.getAll.mockRejectedValue(new Error('Sin conexión'));

    // Act
    const { result } = renderHook(() => useProducts(mockRepository));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // Assert
    expect(result.current.error).not.toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  it('setSearchQuery_porNombre_filtraCorrectamente', async () => {
    // Arrange
    mockRepository.getAll.mockResolvedValue(mockProducts);
    const { result } = renderHook(() => useProducts(mockRepository));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // Act
    act(() => { result.current.setSearchQuery('Tarjeta'); });

    // Assert
    expect(result.current.filteredProducts.length).toBe(1);
    expect(result.current.filteredProducts[0].name).toBe('Tarjetas de Crédito');
  });

  it('setSearchQuery_porId_filtraCorrectamente', async () => {
    // Arrange
    mockRepository.getAll.mockResolvedValue(mockProducts);
    const { result } = renderHook(() => useProducts(mockRepository));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // Act
    act(() => { result.current.setSearchQuery('cta'); });

    // Assert
    expect(result.current.filteredProducts[0].id).toBe('cta-aho');
  });

  it('setSearchQuery_sinResultados_retornaListaVacia', async () => {
    // Arrange
    mockRepository.getAll.mockResolvedValue(mockProducts);
    const { result } = renderHook(() => useProducts(mockRepository));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // Act
    act(() => { result.current.setSearchQuery('xyz-no-existe'); });

    // Assert
    expect(result.current.filteredProducts.length).toBe(0);
    expect(result.current.recordCount).toBe(0);
  });

  it('recordCount_refleja_cantidadDeFiltrados', async () => {
    // Arrange
    mockRepository.getAll.mockResolvedValue(mockProducts);
    const { result } = renderHook(() => useProducts(mockRepository));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // Assert — invariante: recordCount siempre iguala la longitud de la lista filtrada
    expect(result.current.recordCount).toBe(result.current.filteredProducts.length);
  });

  it('deleteProduct_exitoso_retornaTrueYRecargaLista', async () => {
    // Arrange
    mockRepository.getAll.mockResolvedValue(mockProducts);
    mockRepository.delete.mockResolvedValue(undefined);
    const { result } = renderHook(() => useProducts(mockRepository));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // Act
    let success: boolean | undefined;
    await act(async () => {
      success = await result.current.deleteProduct('trj-crd');
    });

    // Assert
    expect(success).toBe(true);
    expect(mockRepository.delete).toHaveBeenCalledWith('trj-crd');
    expect(mockRepository.getAll).toHaveBeenCalledTimes(2); // mount + reload tras delete
  });

  it('deleteProduct_error_retornaFalse', async () => {
    // Arrange
    mockRepository.getAll.mockResolvedValue(mockProducts);
    mockRepository.delete.mockRejectedValue(new Error('No encontrado'));
    const { result } = renderHook(() => useProducts(mockRepository));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // Act
    let success: boolean | undefined;
    await act(async () => {
      success = await result.current.deleteProduct('trj-crd');
    });

    // Assert
    expect(success).toBe(false);
    expect(result.current.isDeleting).toBe(false);
  });
});
