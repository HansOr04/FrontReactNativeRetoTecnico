import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useProductForm } from '../application/hooks/useProductForm';
import type { IProductRepository } from '../domain/repository/IProductRepository';
import type { Product } from '../domain/model/Product';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const FUTURE_DATE = '2099-01-01';
const FUTURE_REVISION = '2100-01-01';

const makeProduct = (): Product => ({
  id: 'tdc-001',
  name: 'Tarjeta de Crédito',
  description: 'Tarjeta con beneficios exclusivos para clientes premium',
  logo: 'https://example.com/logo.png',
  date_release: FUTURE_DATE,
  date_revision: FUTURE_REVISION,
});

const makeRepo = (
  overrides: Partial<Record<keyof IProductRepository, jest.Mock>> = {},
): jest.Mocked<IProductRepository> =>
  ({
    getAll: jest.fn(),
    create: jest.fn().mockResolvedValue(makeProduct()),
    update: jest.fn().mockResolvedValue(makeProduct()),
    delete: jest.fn(),
    verifyId: jest.fn().mockResolvedValue(false),
    ...overrides,
  } as jest.Mocked<IProductRepository>);

const hook = (repo = makeRepo(), product?: Product) =>
  renderHook(() => useProductForm(repo, product));

// ─── Initial state ────────────────────────────────────────────────────────────

describe('useProductForm — estado inicial', () => {
  it('initializes with empty fields in create mode', () => {
    const { result } = hook();
    expect(result.current.formData.id).toBe('');
    expect(result.current.formData.name).toBe('');
    expect(result.current.isEditMode).toBe(false);
  });

  it('initializes with product data in edit mode', () => {
    const product = makeProduct();
    const { result } = hook(makeRepo(), product);
    expect(result.current.formData.name).toBe(product.name);
    expect(result.current.isEditMode).toBe(true);
  });

  it('initializes all validation fields as valid (no premature errors)', () => {
    const { result } = hook();
    const { validationState } = result.current;
    expect(Object.values(validationState).every((f) => f.isValid)).toBe(true);
  });

  it('isSubmitting starts false', () => {
    const { result } = hook();
    expect(result.current.isSubmitting).toBe(false);
  });
});

// ─── updateField — sync validation ────────────────────────────────────────────

describe('useProductForm — updateField: validaciones síncronas', () => {
  it('updates the field value', () => {
    const { result } = hook();
    act(() => { result.current.updateField('name', 'Mi Producto'); });
    expect(result.current.formData.name).toBe('Mi Producto');
  });

  it.each([
    ['', 'El ID es requerido'],
    ['ab', 'El ID debe tener mínimo 3 caracteres'],
    ['12345678901', 'El ID debe tener máximo 10 caracteres'],
  ])('validateId: "%s" → %s', (id, message) => {
    const { result } = hook();
    act(() => { result.current.updateField('id', id); });
    expect(result.current.validationState.id.isValid).toBe(false);
    expect(result.current.validationState.id.errorMessage).toBe(message);
  });

  it.each([
    ['', 'El nombre es requerido'],
    ['abc', 'El nombre debe tener mínimo 5 caracteres'],
    ['x'.repeat(101), 'El nombre debe tener máximo 100 caracteres'],
  ])('validateName: mensaje correcto para "%s"', (name, message) => {
    const { result } = hook();
    act(() => { result.current.updateField('name', name); });
    expect(result.current.validationState.name.errorMessage).toBe(message);
  });

  it.each([
    ['', 'La descripción es requerida'],
    ['corta', 'La descripción debe tener mínimo 10 caracteres'],
    ['x'.repeat(201), 'La descripción debe tener máximo 200 caracteres'],
  ])('validateDescription: mensaje correcto', (desc, message) => {
    const { result } = hook();
    act(() => { result.current.updateField('description', desc); });
    expect(result.current.validationState.description.errorMessage).toBe(message);
  });

  it('validateLogo: empty → error', () => {
    const { result } = hook();
    act(() => { result.current.updateField('logo', ''); });
    expect(result.current.validationState.logo.isValid).toBe(false);
  });

  it('validateDateRelease: past date → error', () => {
    const { result } = hook();
    act(() => { result.current.updateField('date_release', '2000-01-01'); });
    expect(result.current.validationState.date_release.isValid).toBe(false);
    expect(result.current.validationState.date_release.errorMessage).toContain(
      'igual o mayor a la fecha actual',
    );
  });

  it('validateDateRevision: wrong year → error', () => {
    const { result } = hook();
    act(() => { result.current.updateField('date_release', FUTURE_DATE); });
    act(() => { result.current.updateField('date_revision', '2050-01-01'); });
    expect(result.current.validationState.date_revision.isValid).toBe(false);
  });

  it('auto-computes date_revision when date_release is set', () => {
    const { result } = hook();
    act(() => { result.current.updateField('date_release', '2030-06-15'); });
    expect(result.current.formData.date_revision).toBe('2031-06-15');
    expect(result.current.validationState.date_revision.isValid).toBe(true);
  });

  it('revalidates date_revision when date_release changes', () => {
    const { result } = hook();
    act(() => { result.current.updateField('date_release', '2030-01-01'); });
    expect(result.current.validationState.date_revision.isValid).toBe(true);

    act(() => { result.current.updateField('date_release', ''); });
    expect(result.current.validationState.date_revision.isValid).toBe(false);
  });
});

// ─── updateField — async ID validation ────────────────────────────────────────

describe('useProductForm — updateField: validación asíncrona de ID', () => {
  it('marks id invalid when verifyId returns true (already registered)', async () => {
    const repo = makeRepo({ verifyId: jest.fn().mockResolvedValue(true) });
    const { result } = hook(repo);

    act(() => { result.current.updateField('id', 'tdc-001'); });

    await waitFor(() =>
      expect(result.current.validationState.id.isValid).toBe(false),
    );
    expect(result.current.validationState.id.errorMessage).toBe('Este ID ya está registrado');
  });

  it('marks id valid when verifyId returns false (available)', async () => {
    const repo = makeRepo({ verifyId: jest.fn().mockResolvedValue(false) });
    const { result } = hook(repo);

    act(() => { result.current.updateField('id', 'new-001'); });

    await waitFor(() =>
      expect(result.current.validationState.id.isValid).toBe(true),
    );
  });

  it('marks id invalid when verifyId throws', async () => {
    const repo = makeRepo({
      verifyId: jest.fn().mockRejectedValue(new Error('timeout')),
    });
    const { result } = hook(repo);

    act(() => { result.current.updateField('id', 'err-001'); });

    await waitFor(() =>
      expect(result.current.validationState.id.isValid).toBe(false),
    );
    expect(result.current.validationState.id.errorMessage).toBe('No se pudo verificar el ID');
  });

  it('does NOT call verifyId in edit mode', async () => {
    const repo = makeRepo();
    const { result } = hook(repo, makeProduct());

    act(() => { result.current.updateField('id', 'tdc-001'); });

    await new Promise((r) => setTimeout(r, 50));
    expect(repo.verifyId).not.toHaveBeenCalled();
  });
});

// ─── resetForm ────────────────────────────────────────────────────────────────

describe('useProductForm — resetForm', () => {
  it('clears all fields in create mode', () => {
    const { result } = hook();
    act(() => { result.current.updateField('name', 'Temporal'); });
    act(() => { result.current.resetForm(); });
    expect(result.current.formData.name).toBe('');
    expect(result.current.formData.date_revision).toBe('');
  });

  it('restores initial product data in edit mode', () => {
    const product = makeProduct();
    const { result } = hook(makeRepo(), product);
    act(() => { result.current.updateField('name', 'Modificado'); });
    act(() => { result.current.resetForm(); });
    expect(result.current.formData.name).toBe(product.name);
  });

  it('resets validation state to all-valid', async () => {
    const { result } = hook();
    await act(async () => { await result.current.submitForm(jest.fn()); });
    expect(result.current.validationState.name.isValid).toBe(false);

    act(() => { result.current.resetForm(); });
    expect(Object.values(result.current.validationState).every((f) => f.isValid)).toBe(true);
  });
});

// ─── submitForm ───────────────────────────────────────────────────────────────

describe('useProductForm — submitForm', () => {
  const fillValidForm = (result: ReturnType<typeof hook>['result']) => {
    act(() => {
      result.current.updateField('id', 'tdc-001');
      result.current.updateField('name', 'Tarjeta Válida');
      result.current.updateField('description', 'Descripción que supera los diez caracteres');
      result.current.updateField('logo', 'https://logo.com/img.png');
      result.current.updateField('date_release', FUTURE_DATE);
    });
  };

  it('does not call repository when validation fails', async () => {
    const repo = makeRepo();
    const { result } = hook(repo);
    await act(async () => { await result.current.submitForm(jest.fn()); });
    expect(repo.create).not.toHaveBeenCalled();
  });

  it('marks invalid fields on failed submit', async () => {
    const { result } = hook();
    await act(async () => { await result.current.submitForm(jest.fn()); });
    expect(result.current.validationState.id.isValid).toBe(false);
    expect(result.current.validationState.name.isValid).toBe(false);
  });

  it('calls create and invokes onSuccess in create mode', async () => {
    const repo = makeRepo();
    const onSuccess = jest.fn();
    const { result } = hook(repo);

    fillValidForm(result);
    await waitFor(() => expect(result.current.validationState.id.isValid).toBe(true));

    await act(async () => { await result.current.submitForm(onSuccess); });

    expect(repo.create).toHaveBeenCalledTimes(1);
    expect(onSuccess).toHaveBeenCalledWith(expect.objectContaining({ id: 'tdc-001' }));
  });

  it('calls update (not create) in edit mode', async () => {
    const repo = makeRepo();
    const product = makeProduct();
    const onSuccess = jest.fn();
    const { result } = hook(repo, product);

    await act(async () => { await result.current.submitForm(onSuccess); });

    expect(repo.update).toHaveBeenCalledWith(
      product.id,
      expect.not.objectContaining({ id: expect.anything() }),
    );
    expect(repo.create).not.toHaveBeenCalled();
  });

  it('sets submitError when repository throws', async () => {
    const repo = makeRepo({
      create: jest.fn().mockRejectedValue(new Error('Fallo de red')),
    });
    const { result } = hook(repo);
    fillValidForm(result);
    await waitFor(() => expect(result.current.validationState.id.isValid).toBe(true));

    await act(async () => { await result.current.submitForm(jest.fn()); });

    expect(result.current.submitError).toBe('Fallo de red');
  });
});
