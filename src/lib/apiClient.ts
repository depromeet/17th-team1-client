import { env } from "@/config/env";

const API_BASE_URL = env.API_BASE_URL;

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public endpoint: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

const getDefaultHeaders = () => ({
  accept: "*/*",
  "Content-Type": "application/json",
});

const getAuthHeaders = (token?: string) => ({
  ...getDefaultHeaders(),
  ...(token && { Authorization: `Bearer ${token}` }),
});

const parseJsonSafely = async <T>(response: Response): Promise<T> => {
  if (response.status === 204) {
    return undefined as T;
  }

  const bodyText = await response.text();
  if (!bodyText) {
    return undefined as T;
  }

  return JSON.parse(bodyText) as T;
};

export const apiGet = async <T>(
  endpoint: string,
  params?: Record<string, string | number | undefined>,
  token?: string,
): Promise<T> => {
  try {
    const searchParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }

    const url = `${API_BASE_URL}${endpoint}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;

    const response = await fetch(url, {
      method: "GET",
      headers: token ? getAuthHeaders(token) : getDefaultHeaders(),
      cache: "no-store",
    });

    if (!response.ok) {
      throw new ApiError(`HTTP error! status: ${response.status}`, response.status, endpoint);
    }

    return await parseJsonSafely<T>(response);
  } catch (error) {
    console.error(`API GET Error (${endpoint}):`, error);
    throw error;
  }
};

export const apiPost = async <T>(endpoint: string, data?: unknown, token?: string): Promise<T> => {
  try {
    const url = `${API_BASE_URL}${endpoint}`;

    const response = await fetch(url, {
      method: "POST",
      headers: token ? getAuthHeaders(token) : getDefaultHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      throw new ApiError(`HTTP error! status: ${response.status}`, response.status, endpoint);
    }

    return await parseJsonSafely<T>(response);
  } catch (error) {
    console.error(`API POST Error (${endpoint}):`, error);
    throw error;
  }
};

export const apiPut = async <T>(endpoint: string, data?: unknown, token?: string): Promise<T> => {
  try {
    const url = `${API_BASE_URL}${endpoint}`;

    const response = await fetch(url, {
      method: "PUT",
      headers: token ? getAuthHeaders(token) : getDefaultHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      throw new ApiError(`HTTP error! status: ${response.status}`, response.status, endpoint);
    }

    return await parseJsonSafely<T>(response);
  } catch (error) {
    console.error(`API PUT Error (${endpoint}):`, error);
    throw error;
  }
};

export const apiPatch = async <T>(endpoint: string, data?: unknown, token?: string): Promise<T> => {
  try {
    const url = `${API_BASE_URL}${endpoint}`;

    const response = await fetch(url, {
      method: "PATCH",
      headers: token ? getAuthHeaders(token) : getDefaultHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      throw new ApiError(`HTTP error! status: ${response.status}`, response.status, endpoint);
    }

    return await parseJsonSafely<T>(response);
  } catch (error) {
    console.error(`API PATCH Error (${endpoint}):`, error);
    throw error;
  }
};

export const apiDelete = async <T>(endpoint: string, token?: string): Promise<T> => {
  try {
    const url = `${API_BASE_URL}${endpoint}`;

    const response = await fetch(url, {
      method: "DELETE",
      headers: token ? getAuthHeaders(token) : getDefaultHeaders(),
    });

    if (!response.ok) {
      throw new ApiError(`HTTP error! status: ${response.status}`, response.status, endpoint);
    }

    return await parseJsonSafely<T>(response);
  } catch (error) {
    console.error(`API DELETE Error (${endpoint}):`, error);
    throw error;
  }
};
