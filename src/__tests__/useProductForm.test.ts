import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useProductForm } from '../application/hooks/useProductForm';

jest.mock('../infrastructure/api/ProductApiRepository', () => ({
  ProductApiRepository: jest.fn().mockImplementation(() => ({
    verifyId: jest.fn().mockResolvedValue(false),
    create: jest.fn().mockResolvedValue({}),
    update: jest.fn().mockResolvedValue({}),
  })),
}));

const validProduct = {
  id: 'tdc-001',
  name: 'Tarjeta de Crédito',
  description: 'Tarjeta de crédito con beneficios exclusivos para clientes premium',
  logo: 'https://example.com/logo.png',
  date_release: '2030-01-01',
  date_revision: '2031-01-01',
};

describe('useProductForm — initial state', () => {
  it('should initialize with empty fields when no product is provided', () => {
    const { result } = renderHook(() => useProductForm());
    expect(result.current.formData.id).toBe('');
    expect(result.current.formData.name).toBe('');
    expect(result.current.isEditing).toBe(false);
  });

  it('should initialize with product data when editing', () => {
    const { result } = renderHook(() => useProductForm(validProduct));
    expect(result.current.formData.name).toBe(validProduct.name);
    expect(result.current.isEditing).toBe(true);
  });
});

describe('useProductForm — updateField', () => {
  it('should update a specific field', () => {
    const { result } = renderHook(() => useProductForm());
    act(() => {
      result.current.updateField('name', 'Nuevo Nombre');
    });
    expect(result.current.formData.name).toBe('Nuevo Nombre');
  });

  it('should clear the field error when the field is updated', async () => {
    const { result } = renderHook(() => useProductForm());
    await act(async () => {
      await result.current.submit();
    });
    expect(result.current.errors.name).toBeDefined();

    act(() => {
      result.current.updateField('name', 'Algo válido');
    });
    expect(result.current.errors.name).toBeUndefined();
  });
});

describe('useProductForm — reset', () => {
  it('should clear all fields and errors', async () => {
    const { result } = renderHook(() => useProductForm());
    act(() => {
      result.current.updateField('name', 'Temp');
    });
    act(() => {
      result.current.reset();
    });
    expect(result.current.formData.name).toBe('');
    expect(result.current.errors).toEqual({});
  });
});

describe('useProductForm — validation', () => {
  it('should set errors for all required fields on empty submit', async () => {
    const { result } = renderHook(() => useProductForm());
    await act(async () => {
      await result.current.submit();
    });
    expect(Object.keys(result.current.errors).length).toBeGreaterThan(0);
    expect(result.current.errors.id).toBeDefined();
    expect(result.current.errors.name).toBeDefined();
    expect(result.current.errors.description).toBeDefined();
  });

  it('should reject an ID shorter than 3 characters', async () => {
    const { result } = renderHook(() => useProductForm());
    act(() => {
      result.current.updateField('id', 'ab');
    });
    await act(async () => {
      await result.current.submit();
    });
    expect(result.current.errors.id).toBeDefined();
  });

  it('should call onSuccess after a valid create submission', async () => {
    const onSuccess = jest.fn();
    const { result } = renderHook(() => useProductForm(undefined, onSuccess));

    act(() => {
      result.current.updateField('id', validProduct.id);
      result.current.updateField('name', validProduct.name);
      result.current.updateField('description', validProduct.description);
      result.current.updateField('logo', validProduct.logo);
      result.current.updateField('date_release', validProduct.date_release);
    });

    await act(async () => {
      await result.current.submit();
    });

    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
  });
});
