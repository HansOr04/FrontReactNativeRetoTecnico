/**
 * Base URL for the backend REST API.
 * Change this value to point to a different environment.
 * In production, load it from a .env file via react-native-config.
 */
const BASE_URL = 'http://localhost:3002/bp';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

const request = async <T>(
  method: HttpMethod,
  endpoint: string,
  body?: unknown,
): Promise<T> => {
  const options: RequestInit = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };

  if (body !== undefined) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, options);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Request failed with status ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
};

/**
 * Minimal HTTP client built on the Fetch API.
 * All methods throw on non-2xx responses.
 */
export const apiClient = {
  get: <T>(endpoint: string) => request<T>('GET', endpoint),
  post: <T>(endpoint: string, body: unknown) => request<T>('POST', endpoint, body),
  put: <T>(endpoint: string, body: unknown) => request<T>('PUT', endpoint, body),
  delete: (endpoint: string) => request<void>('DELETE', endpoint),
};
