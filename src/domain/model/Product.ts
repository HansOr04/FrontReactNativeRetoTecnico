/**
 * Core domain entity representing a bank financial product.
 * @interface Product
 */
export interface Product {
  /** Unique identifier (3–10 characters) */
  id: string;
  /** Display name of the product (5–100 characters) */
  name: string;
  /** Detailed description (10–200 characters) */
  description: string;
  /** URL or path to the product logo */
  logo: string;
  /** Release date in ISO 8601 format (YYYY-MM-DD), must be >= today */
  date_release: string;
  /** Revision date — always exactly one year after date_release */
  date_revision: string;
}

/**
 * Form input data for creating or updating a product.
 * Excludes date_revision which is auto-computed from date_release.
 */
export type ProductFormData = Omit<Product, 'date_revision'>;

/**
 * Validation error messages keyed by ProductFormData field name.
 */
export type ProductFormErrors = Partial<Record<keyof ProductFormData, string>>;
