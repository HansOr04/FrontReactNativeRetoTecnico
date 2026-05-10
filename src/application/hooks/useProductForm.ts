import { useState, useCallback } from 'react';
import type {
  Product,
  ProductFormData,
  FieldValidation,
  FormValidationState,
} from '../../domain/model/Product';
import type { IProductRepository } from '../../domain/repository/IProductRepository';
import { productRepository } from '../../infrastructure/api/ProductApiRepository';

// ─── Pure validation functions (OCP: each field is an isolated rule) ──────────

const valid = (): FieldValidation => ({ isValid: true, errorMessage: null });
const invalid = (errorMessage: string): FieldValidation => ({ isValid: false, errorMessage });

function validateId(id: string): FieldValidation {
  if (!id) return invalid('El ID es requerido');
  if (id.length < 3) return invalid('El ID debe tener mínimo 3 caracteres');
  if (id.length > 10) return invalid('El ID debe tener máximo 10 caracteres');
  return valid();
}

function validateName(name: string): FieldValidation {
  if (!name) return invalid('El nombre es requerido');
  if (name.length < 5) return invalid('El nombre debe tener mínimo 5 caracteres');
  if (name.length > 100) return invalid('El nombre debe tener máximo 100 caracteres');
  return valid();
}

function validateDescription(description: string): FieldValidation {
  if (!description) return invalid('La descripción es requerida');
  if (description.length < 10) return invalid('La descripción debe tener mínimo 10 caracteres');
  if (description.length > 200) return invalid('La descripción debe tener máximo 200 caracteres');
  return valid();
}

function validateLogo(logo: string): FieldValidation {
  if (!logo) return invalid('El logo es requerido');
  return valid();
}

function validateDateRelease(dateRelease: string): FieldValidation {
  if (!dateRelease) return invalid('La fecha de liberación es requerida');
  const today = new Date().toISOString().split('T')[0] as string;
  if (dateRelease < today) {
    return invalid('La fecha de liberación debe ser igual o mayor a la fecha actual');
  }
  return valid();
}

function validateDateRevision(dateRevision: string, dateRelease: string): FieldValidation {
  if (!dateRevision) return invalid('La fecha de revisión es requerida');
  if (!dateRelease) return valid();
  const expected = new Date(dateRelease);
  expected.setFullYear(expected.getFullYear() + 1);
  const expectedStr = expected.toISOString().split('T')[0] as string;
  if (dateRevision !== expectedStr) {
    return invalid('La fecha de revisión debe ser exactamente un año después de la liberación');
  }
  return valid();
}

async function validateIdUniqueness(
  id: string,
  repository: IProductRepository,
): Promise<FieldValidation> {
  try {
    const exists = await repository.verifyId(id);
    return exists ? invalid('Este ID ya está registrado') : valid();
  } catch {
    return invalid('No se pudo verificar el ID');
  }
}

// ─── Constants ────────────────────────────────────────────────────────────────

const INITIAL_VALIDATION: FormValidationState = {
  id: valid(),
  name: valid(),
  description: valid(),
  logo: valid(),
  date_release: valid(),
  date_revision: valid(),
};

const EMPTY_FORM: ProductFormData = {
  id: '',
  name: '',
  description: '',
  logo: '',
  date_release: '',
  date_revision: '',
};

const addOneYear = (dateStr: string): string => {
  const date = new Date(dateStr);
  date.setFullYear(date.getFullYear() + 1);
  return date.toISOString().split('T')[0] as string;
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Hook de aplicación para el formulario de productos financieros.
 * Maneja estado de campos, validaciones síncronas y asíncronas,
 * y las operaciones de creación y edición.
 *
 * @param repository - Repositorio inyectado para verificación de ID
 * @param initialProduct - Si se provee, el formulario inicia en modo edición
 */
export const useProductForm = (
  repository: IProductRepository = productRepository,
  initialProduct?: Product,
) => {
  const isEditMode = Boolean(initialProduct);

  const [formData, setFormData] = useState<ProductFormData>(
    initialProduct ?? EMPTY_FORM,
  );
  const [validationState, setValidationState] = useState<FormValidationState>(
    INITIAL_VALIDATION,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  /**
   * Actualiza un campo, ejecuta validación síncrona inmediata y —si el campo
   * es id con longitud válida en modo creación— dispara verificación asíncrona.
   * Al cambiar date_release, auto-computa date_revision y revalida ambos.
   */
  const updateField = useCallback(
    (field: keyof ProductFormData, value: string) => {
      let next = { ...formData, [field]: value };
      if (field === 'date_release' && value) {
        next = { ...next, date_revision: addOneYear(value) };
      }
      setFormData(next);

      const updates: Partial<FormValidationState> = {};
      switch (field) {
        case 'id':          updates.id = validateId(value); break;
        case 'name':        updates.name = validateName(value); break;
        case 'description': updates.description = validateDescription(value); break;
        case 'logo':        updates.logo = validateLogo(value); break;
        case 'date_release':
          updates.date_release = validateDateRelease(value);
          updates.date_revision = validateDateRevision(next.date_revision, value);
          break;
        case 'date_revision':
          updates.date_revision = validateDateRevision(value, next.date_release);
          break;
      }
      setValidationState((prev) => ({ ...prev, ...updates }));

      if (field === 'id' && !isEditMode && value.length >= 3 && value.length <= 10) {
        validateIdUniqueness(value, repository).then((result) => {
          setValidationState((prev) => ({ ...prev, id: result }));
        });
      }
    },
    [formData, isEditMode, repository],
  );

  /**
   * Ejecuta todas las validaciones síncronas y, en modo creación, la verificación
   * asíncrona de unicidad de ID.
   * @returns true solo si todos los campos son válidos.
   */
  const validateAllFields = useCallback(async (): Promise<boolean> => {
    const state: FormValidationState = {
      id: validateId(formData.id),
      name: validateName(formData.name),
      description: validateDescription(formData.description),
      logo: validateLogo(formData.logo),
      date_release: validateDateRelease(formData.date_release),
      date_revision: validateDateRevision(formData.date_revision, formData.date_release),
    };

    if (!isEditMode && state.id.isValid) {
      state.id = await validateIdUniqueness(formData.id, repository);
    }

    setValidationState(state);
    return Object.values(state).every((f) => f.isValid);
  }, [formData, isEditMode, repository]);

  /**
   * Valida todo el formulario y, si es válido, llama a create o update según el modo.
   * @param onSuccess - Callback invocado con el producto persistido tras el éxito.
   */
  const submitForm = useCallback(
    async (onSuccess: (product: Product) => void): Promise<void> => {
      const isValid = await validateAllFields();
      if (!isValid) return;

      setIsSubmitting(true);
      setSubmitError(null);
      try {
        let product: Product;
        if (isEditMode && initialProduct) {
          product = await repository.update(initialProduct.id, {
            name: formData.name,
            description: formData.description,
            logo: formData.logo,
            date_release: formData.date_release,
            date_revision: formData.date_revision,
          });
        } else {
          product = await repository.create(formData);
        }
        onSuccess(product);
      } catch (err) {
        setSubmitError(
          err instanceof Error ? err.message : 'Error al guardar el producto',
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [validateAllFields, isEditMode, initialProduct, formData, repository],
  );

  /** Restaura el formulario al estado inicial (vacío en creación, producto original en edición). */
  const resetForm = useCallback(() => {
    setFormData(initialProduct ?? EMPTY_FORM);
    setValidationState(INITIAL_VALIDATION);
    setSubmitError(null);
  }, [initialProduct]);

  return {
    formData,
    validationState,
    isSubmitting,
    submitError,
    isEditMode,
    updateField,
    submitForm,
    resetForm,
  };
};
