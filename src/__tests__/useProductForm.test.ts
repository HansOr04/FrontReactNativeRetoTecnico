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

  it('should initialize all validation fields as valid', () => {
    const { result } = renderHook(() => useProductForm());
    const { validation } = result.current;
    expect(validation.id.isValid).toBe(true);
    expect(validation.name.isValid).toBe(true);
    expect(validation.description.isValid).toBe(true);
    expect(validation.logo.isValid).toBe(true);
    expect(validation.date_release.isValid).toBe(true);
    expect(validation.date_revision.isValid).toBe(true);
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

  it('should auto-compute date_revision when date_release is set', () => {
    const { result } = renderHook(() => useProductForm());
    act(() => {
      result.current.updateField('date_release', '2030-06-15');
    });
    expect(result.current.formData.date_revision).toBe('2031-06-15');
  });

  it('should clear the field validation error when the field is updated', async () => {
    const { result } = renderHook(() => useProductForm());
    await act(async () => {
      await result.current.submit();
    });
    expect(result.current.validation.name.isValid).toBe(false);

    act(() => {
      result.current.updateField('name', 'Algo válido');
    });
    expect(result.current.validation.name.isValid).toBe(true);
    expect(result.current.validation.name.errorMessage).toBeNull();
  });
});

describe('useProductForm — reset', () => {
  it('should clear all fields and reset validation to valid', async () => {
    const { result } = renderHook(() => useProductForm());
    act(() => {
      result.current.updateField('name', 'Temp');
    });
    act(() => {
      result.current.reset();
    });
    expect(result.current.formData.name).toBe('');
    expect(result.current.formData.date_revision).toBe('');
    expect(result.current.validation.name.isValid).toBe(true);
  });
});

describe('useProductForm — validation', () => {
  it('should set invalid fields on empty form submission', async () => {
    const { result } = renderHook(() => useProductForm());
    await act(async () => {
      await result.current.submit();
    });
    const { validation } = result.current;
    expect(Object.values(validation).some((f) => !f.isValid)).toBe(true);
    expect(validation.id.isValid).toBe(false);
    expect(validation.name.isValid).toBe(false);
    expect(validation.description.isValid).toBe(false);
  });

  it('should set errorMessage on invalid fields', async () => {
    const { result } = renderHook(() => useProductForm());
    await act(async () => {
      await result.current.submit();
    });
    expect(result.current.validation.id.errorMessage).toBeTruthy();
    expect(result.current.validation.name.errorMessage).toBeTruthy();
  });

  it('should reject an ID shorter than 3 characters', async () => {
    const { result } = renderHook(() => useProductForm());
    act(() => {
      result.current.updateField('id', 'ab');
    });
    await act(async () => {
      await result.current.submit();
    });
    expect(result.current.validation.id.isValid).toBe(false);
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
