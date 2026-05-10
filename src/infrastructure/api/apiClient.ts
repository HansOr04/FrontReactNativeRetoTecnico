/**
 * Cliente HTTP base para comunicación con el backend bancario.
 * Centraliza la URL base, los headers y el manejo de errores HTTP.
 *
 * URL configurable para facilitar el cambio entre entornos:
 * - Desarrollo local: http://localhost:3002
 * - Emulador Android: http://10.0.2.2:3002
 * - Dispositivo físico: http://{IP_LOCAL}:3002
 */

const BASE_URL = 'http://localhost:3002/bp';

/**
 * Encabezados comunes para todas las requests.
 */
const DEFAULT_HEADERS: Record<string, string> = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
};

/**
 * Realiza una request HTTP genérica con manejo centralizado de errores.
 * @throws Error con mensaje descriptivo en caso de fallo de red o HTTP 4xx/5xx
 */
async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  try {
    const response = await fetch(url, {
      ...options,
      headers: { ...DEFAULT_HEADERS, ...options.headers },
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      throw new Error(
        (errorBody as { message?: string }).message ??
          `Error ${response.status}: ${response.statusText}`,
      );
    }

    // DELETE retorna 200 con mensaje — no siempre hay body JSON
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      return response.json() as Promise<T>;
    }
    return {} as T;
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error('Error de conexión con el servidor bancario');
  }
}

export const apiClient = {
  get: <T>(endpoint: string) => request<T>(endpoint),
  post: <T>(endpoint: string, body: unknown) =>
    request<T>(endpoint, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(endpoint: string, body: unknown) =>
    request<T>(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
  delete: <T>(endpoint: string) =>
    request<T>(endpoint, { method: 'DELETE' }),
};
