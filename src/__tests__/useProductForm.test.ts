import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useProductForm } from '../application/hooks/useProductForm';
import type { IProductRepository } from '../domain/repository/IProductRepository';
import type { Product } from '../domain/model/Product';

// ─── Test data ────────────────────────────────────────────────────────────────

const makeProduct = (): Product => ({
  id: 'trj-crd',
  name: 'Tarjetas de Crédito',
  description: 'Tarjeta de consumo bajo la modalidad de crédito',
  logo: 'https://www.visa.com.ec/logo.png',
  date_release: '2099-01-01',
  date_revision: '2100-01-01',
});

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
  // Default stubs — individual tests override what they need.
  mockRepository.verifyId.mockResolvedValue(false);
  mockRepository.create.mockResolvedValue(makeProduct());
  mockRepository.update.mockResolvedValue(makeProduct());
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('useProductForm', () => {
  it('validateId_vacio_retornaError', () => {
    // Arrange
    const { result } = renderHook(() => useProductForm(mockRepository));

    // Act
    act(() => { result.current.updateField('id', ''); });

    // Assert
    expect(result.current.validationState.id.isValid).toBe(false);
    expect(result.current.validationState.id.errorMessage).toBe('El ID es requerido');
  });

  it('validateId_menosDe3Caracteres_retornaError', () => {
    // Arrange
    const { result } = renderHook(() => useProductForm(mockRepository));

    // Act
    act(() => { result.current.updateField('id', 'ab'); });

    // Assert
    expect(result.current.validationState.id.errorMessage).toContain('mínimo 3 caracteres');
  });

  it('validateId_masDe10Caracteres_retornaError', () => {
    // Arrange
    const { result } = renderHook(() => useProductForm(mockRepository));

    // Act
    act(() => { result.current.updateField('id', 'id-muy-largo-excede'); });

    // Assert
    expect(result.current.validationState.id.errorMessage).toContain('máximo 10 caracteres');
  });

  it('validateId_valido_retornaIsValidTrue', async () => {
    // Arrange — verifyId ya configurado como false (ID disponible) en beforeEach
    const { result } = renderHook(() => useProductForm(mockRepository));

    // Act
    act(() => { result.current.updateField('id', 'trj-crd'); });

    // Assert — espera la verificación asíncrona de unicidad
    await waitFor(() =>
      expect(result.current.validationState.id.isValid).toBe(true),
    );
  });

  it('validateName_menosDe5Caracteres_retornaError', () => {
    // Arrange
    const { result } = renderHook(() => useProductForm(mockRepository));

    // Act
    act(() => { result.current.updateField('name', 'Tar'); });

    // Assert
    expect(result.current.validationState.name.errorMessage).toContain('mínimo 5 caracteres');
  });

  it('validateDescription_menosDe10Caracteres_retornaError', () => {
    // Arrange
    const { result } = renderHook(() => useProductForm(mockRepository));

    // Act
    act(() => { result.current.updateField('description', 'Corta'); });

    // Assert
    expect(result.current.validationState.description.isValid).toBe(false);
  });

  it('validateDateRelease_fechaPasada_retornaError', () => {
    // Arrange
    const { result } = renderHook(() => useProductForm(mockRepository));

    // Act
    act(() => { result.current.updateField('date_release', '2020-01-01'); });

    // Assert
    expect(result.current.validationState.date_release.errorMessage).toContain(
      'mayor a la fecha actual',
    );
  });

  it('validateDateRevision_autoCalculada_esUnAnioDespues', () => {
    // Arrange
    const { result } = renderHook(() => useProductForm(mockRepository));

    // Act
    act(() => { result.current.updateField('date_release', '2024-03-15'); });

    // Assert — la revisión se calcula en el hook independientemente de la validez de la fecha
    expect(result.current.formData.date_revision).toBe('2025-03-15');
  });

  it('validateIdUniqueness_idExistente_retornaError', async () => {
    // Arrange — el ID ya existe en el sistema
    mockRepository.verifyId.mockResolvedValue(true);
    const { result } = renderHook(() => useProductForm(mockRepository));

    // Act
    act(() => { result.current.updateField('id', 'trj-crd'); });

    // Assert
    await waitFor(() =>
      expect(result.current.validationState.id.errorMessage).toBe('Este ID ya está registrado'),
    );
  });

  it('validateIdUniqueness_idLibre_retornaValido', async () => {
    // Arrange — el ID está disponible (beforeEach ya configura verifyId → false)
    const { result } = renderHook(() => useProductForm(mockRepository));

    // Act
    act(() => { result.current.updateField('id', 'trj-crd'); });

    // Assert
    await waitFor(() =>
      expect(result.current.validationState.id.isValid).toBe(true),
    );
  });

  it('resetForm_limpiaFormDataYValidacion', async () => {
    // Arrange — submit vacío para forzar errores de validación en todos los campos
    const { result } = renderHook(() => useProductForm(mockRepository));
    await act(async () => { await result.current.submitForm(jest.fn()); });
    expect(result.current.validationState.name.isValid).toBe(false);

    // Act
    act(() => { result.current.resetForm(); });

    // Assert — formData vacío
    expect(result.current.formData.id).toBe('');
    expect(result.current.formData.name).toBe('');
    expect(result.current.formData.description).toBe('');
    expect(result.current.formData.logo).toBe('');
    expect(result.current.formData.date_release).toBe('');
    expect(result.current.formData.date_revision).toBe('');
    // Assert — validación reiniciada a estado inicial sin errores
    expect(
      Object.values(result.current.validationState).every((f) => f.errorMessage === null),
    ).toBe(true);
  });

  it('submitForm_camposInvalidos_noLlamaAlRepositorio', async () => {
    // Arrange — formulario vacío; toda validación fallará
    const { result } = renderHook(() => useProductForm(mockRepository));

    // Act
    await act(async () => { await result.current.submitForm(jest.fn()); });

    // Assert
    expect(mockRepository.create).not.toHaveBeenCalled();
  });
});
