import { useState, useCallback } from 'react';
import type {
  Product,
  ProductFormData,
  FieldValidation,
  FormValidationState,
} from '../../domain/model/Product';
import type { IProductRepository } from '../../domain/repository/IProductRepository';
import { ProductApiRepository } from '../../infrastructure/api/ProductApiRepository';

const repository: IProductRepository = new ProductApiRepository();

const VALID: FieldValidation = { isValid: true, errorMessage: null };
const invalid = (message: string): FieldValidation => ({ isValid: false, errorMessage: message });

const INITIAL_VALIDATION: FormValidationState = {
  id: VALID,
  name: VALID,
  description: VALID,
  logo: VALID,
  date_release: VALID,
  date_revision: VALID,
};

/** Returns a date string one year after the given ISO date string. */
const addOneYear = (dateStr: string): string => {
  const date = new Date(dateStr);
  date.setFullYear(date.getFullYear() + 1);
  return date.toISOString().split('T')[0] as string;
};

const validate = async (
  data: ProductFormData,
  isEditing: boolean,
): Promise<FormValidationState> => {
  const state: FormValidationState = { ...INITIAL_VALIDATION };

  if (!data.id || data.id.length < 3 || data.id.length > 10) {
    state.id = invalid('El ID debe tener entre 3 y 10 caracteres');
  } else if (!isEditing) {
    const exists = await repository.verifyId(data.id);
    if (exists) {
      state.id = invalid('El ID ya existe');
    }
  }

  if (!data.name || data.name.length < 5 || data.name.length > 100) {
    state.name = invalid('El nombre debe tener entre 5 y 100 caracteres');
  }

  if (!data.description || data.description.length < 10 || data.description.length > 200) {
    state.description = invalid('La descripción debe tener entre 10 y 200 caracteres');
  }

  if (!data.logo) {
    state.logo = invalid('El logo es requerido');
  }

  if (data.date_release) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const releaseDate = new Date(data.date_release);
    if (releaseDate < today) {
      state.date_release = invalid('La fecha de liberación debe ser igual o mayor a hoy');
    }
  } else {
    state.date_release = invalid('La fecha de liberación es requerida');
  }

  return state;
};

/**
 * Manages product form state, field-level validation, and create/update submission.
 *
 * Business rules encapsulated here:
 * - date_revision se auto-computa como date_release + 1 año al cambiar el campo.
 * - La unicidad del ID se valida contra el repositorio solo al crear.
 * - Los errores de validación se limpian por campo al escribir.
 *
 * @param initialData - Producto existente cuando se edita una entrada.
 * @param onSuccess   - Callback invocado tras un crear o actualizar exitoso.
 */
export const useProductForm = (
  initialData?: Product,
  onSuccess?: () => void,
) => {
  const isEditing = Boolean(initialData);

  const [formData, setFormData] = useState<ProductFormData>({
    id: initialData?.id ?? '',
    name: initialData?.name ?? '',
    description: initialData?.description ?? '',
    logo: initialData?.logo ?? '',
    date_release: initialData?.date_release ?? '',
    date_revision: initialData?.date_revision ?? '',
  });

  const [validation, setValidation] = useState<FormValidationState>(INITIAL_VALIDATION);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const updateField = useCallback(
    <K extends keyof ProductFormData>(field: K, value: ProductFormData[K]) => {
      setFormData((prev) => {
        const next = { ...prev, [field]: value };
        // Auto-compute date_revision whenever date_release is set
        if (field === 'date_release' && typeof value === 'string' && value) {
          next.date_revision = addOneYear(value);
        }
        return next;
      });
      setValidation((prev) => ({ ...prev, [field]: VALID }));
    },
    [],
  );

  const reset = useCallback(() => {
    setFormData({
      id: '',
      name: '',
      description: '',
      logo: '',
      date_release: '',
      date_revision: '',
    });
    setValidation(INITIAL_VALIDATION);
    setSubmitError(null);
  }, []);

  const submit = useCallback(async () => {
    const result = await validate(formData, isEditing);
    const hasErrors = Object.values(result).some((f) => !f.isValid);
    if (hasErrors) {
      setValidation(result);
      return;
    }

    setLoading(true);
    setSubmitError(null);
    try {
      if (isEditing && initialData) {
        await repository.update(initialData.id, {
          name: formData.name,
          description: formData.description,
          logo: formData.logo,
          date_release: formData.date_release,
          date_revision: formData.date_revision,
        });
      } else {
        await repository.create(formData);
      }
      onSuccess?.();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Error al guardar producto');
    } finally {
      setLoading(false);
    }
  }, [formData, isEditing, initialData, onSuccess]);

  return {
    formData,
    validation,
    loading,
    submitError,
    updateField,
    reset,
    submit,
    isEditing,
  };
};
