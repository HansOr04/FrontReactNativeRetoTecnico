/**
 * Representa un producto financiero ofertado por el banco.
 * Es la entidad central del dominio — inmutable una vez creada.
 */
export interface Product {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly logo: string;
  readonly date_release: string; // ISO date string: "YYYY-MM-DD"
  readonly date_revision: string; // ISO date string: "YYYY-MM-DD"
}

/**
 * Datos necesarios para crear o actualizar un producto financiero.
 * Todos los campos son requeridos — las validaciones están en useProductForm.
 */
export interface ProductFormData {
  id: string;
  name: string;
  description: string;
  logo: string;
  date_release: string;
  date_revision: string;
}

/**
 * Resultado de una validación de campo individual.
 */
export interface FieldValidation {
  readonly isValid: boolean;
  readonly errorMessage: string | null;
}

/**
 * Estado completo de validación del formulario de producto.
 * Un campo por cada campo del ProductFormData.
 */
export interface FormValidationState {
  id: FieldValidation;
  name: FieldValidation;
  description: FieldValidation;
  logo: FieldValidation;
  date_release: FieldValidation;
  date_revision: FieldValidation;
}
