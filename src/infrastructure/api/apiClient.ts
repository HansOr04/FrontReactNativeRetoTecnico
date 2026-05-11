const BASE_URL = 'http://10.0.2.2:3002/bp';

const DEFAULT_HEADERS: Record<string, string> = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
};

const HTTP_MESSAGES: Record<number, string> = {
  400: 'Los datos enviados no son válidos. Revisa los campos e intenta de nuevo.',
  401: 'No autorizado. Reinicia la sesión.',
  403: 'No tienes permisos para realizar esta acción.',
  404: 'El recurso solicitado no fue encontrado.',
  409: 'Ya existe un producto con ese identificador.',
  500: 'Error interno del servidor. Intenta más tarde.',
  503: 'Servicio no disponible. Intenta más tarde.',
};

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  try {
    const response = await fetch(url, {
      ...options,
      headers: { ...DEFAULT_HEADERS, ...options.headers },
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      const serverMessage = (errorBody as { message?: string }).message;
      throw new Error(serverMessage ?? HTTP_MESSAGES[response.status] ?? `Error ${response.status}`);
    }

    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      return response.json() as Promise<T>;
    }
    return {} as T;
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Network request failed') {
        throw new Error('Sin conexión al servidor. Verifica tu red e intenta de nuevo.');
      }
      throw error;
    }
    throw new Error('Error de conexión inesperado.');
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
