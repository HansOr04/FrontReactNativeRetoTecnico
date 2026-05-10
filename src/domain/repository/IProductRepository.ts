import type { Product } from '../model/Product';

/**
 * Contract defining all data-access operations for products.
 * UI and application layers depend on this abstraction, not on
 * any concrete HTTP or storage implementation (DIP).
 *
 * @interface IProductRepository
 */
export interface IProductRepository {
  /** Fetches the complete list of products from the data source. */
  getAll(): Promise<Product[]>;

  /** Creates a new product and returns the persisted entity. */
  create(product: Product): Promise<Product>;

  /** Updates an existing product identified by id. */
  update(id: string, product: Product): Promise<Product>;

  /** Deletes the product with the given id. */
  delete(id: string): Promise<void>;

  /** Returns true if a product with the given id already exists. */
  verifyId(id: string): Promise<boolean>;
}
