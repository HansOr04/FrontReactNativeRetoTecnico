import type { Product, ProductFormData } from '../model/Product';

/**
 * Contrato de acceso a datos para productos financieros.
 * El dominio define QUÉ necesita — la infraestructura define CÓMO.
 * Esto permite cambiar la implementación (API, mock, cache)
 * sin modificar la lógica de aplicación.
 */
export interface IProductRepository {
  /**
   * Obtiene todos los productos financieros disponibles.
   * @returns Lista de productos o lanza error si el servidor no responde
   */
  getAll(): Promise<Product[]>;

  /**
   * Crea un nuevo producto financiero.
   * @param product - Datos completos del producto a crear
   * @throws Error si el ID ya existe o los datos son inválidos
   */
  create(product: ProductFormData): Promise<Product>;

  /**
   * Actualiza un producto financiero existente.
   * @param id - ID del producto a actualizar
   * @param product - Nuevos datos del producto (sin el ID, que ya viene en la ruta)
   * @throws Error si el producto no existe
   */
  update(id: string, product: Omit<ProductFormData, 'id'>): Promise<Product>;

  /**
   * Elimina un producto financiero.
   * @param id - ID del producto a eliminar
   * @throws Error si el producto no existe
   */
  delete(id: string): Promise<void>;

  /**
   * Verifica si un ID de producto ya existe en el sistema.
   * @param id - ID a verificar
   * @returns true si el ID ya está registrado, false si está disponible
   */
  verifyId(id: string): Promise<boolean>;
}
