import { useState, useCallback } from 'react';
import type {
  Product,
  ProductFormData,
  ProductFormErrors,
} from '../../domain/model/Product';
import type { IProductRepository } from '../../domain/repository/IProductRepository';
import { ProductApiRepository } from '../../infrastructure/api/ProductApiRepository';

const repository: IProductRepository = new ProductApiRepository();

/** Returns a date string one year after the given ISO date string. */
const addOneYear = (dateStr: string): string => {
  const date = new Date(dateStr);
  date.setFullYear(date.getFullYear() + 1);
  return date.toISOString().split('T')[0] as string;
};

const validate = async (
  data: ProductFormData,
  isEditing: boolean,
): Promise<ProductFormErrors> => {
  const errors: ProductFormErrors = {};

  if (!data.id || data.id.length < 3 || data.id.length > 10) {
    errors.id = 'El ID debe tener entre 3 y 10 caracteres';
  } else if (!isEditing) {
    const exists = await repository.verifyId(data.id);
    if (exists) {
      errors.id = 'El ID ya existe';
    }
  }

  if (!data.name || data.name.length < 5 || data.name.length > 100) {
    errors.name = 'El nombre debe tener entre 5 y 100 caracteres';
  }

  if (!data.description || data.description.length < 10 || data.description.length > 200) {
    errors.description = 'La descripción debe tener entre 10 y 200 caracteres';
  }

  if (!data.logo) {
    errors.logo = 'El logo es requerido';
  }

  if (data.date_release) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const releaseDate = new Date(data.date_release);
    if (releaseDate < today) {
      errors.date_release = 'La fecha de liberación debe ser igual o mayor a hoy';
    }
  } else {
    errors.date_release = 'La fecha de liberación es requerida';
  }

  return errors;
};

/**
 * Manages product form state, field-level validation, and create/update submission.
 *
 * Business rules encapsulated here:
 * - date_revision is auto-computed as date_release + 1 year on submit.
 * - ID uniqueness is validated via the repository only when creating.
 * - Validation errors are cleared per-field as the user types.
 *
 * @param initialData - Pre-populated product when editing an existing entry.
 * @param onSuccess   - Callback invoked after a successful create or update.
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
  });

  const [errors, setErrors] = useState<ProductFormErrors>({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const updateField = useCallback(
    <K extends keyof ProductFormData>(field: K, value: ProductFormData[K]) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    },
    [],
  );

  const reset = useCallback(() => {
    setFormData({ id: '', name: '', description: '', logo: '', date_release: '' });
    setErrors({});
    setSubmitError(null);
  }, []);

  const submit = useCallback(async () => {
    const validationErrors = await validate(formData, isEditing);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const product: Product = {
      ...formData,
      date_revision: addOneYear(formData.date_release),
    };

    setLoading(true);
    setSubmitError(null);
    try {
      if (isEditing && initialData) {
        await repository.update(initialData.id, product);
      } else {
        await repository.create(product);
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
    errors,
    loading,
    submitError,
    updateField,
    reset,
    submit,
    isEditing,
  };
};
