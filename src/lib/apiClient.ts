import { env } from "@/config/env";

const API_BASE_URL = env.API_BASE_URL;

export class ApiError extends Error {
  constructor(message: string, public status: number, public endpoint: string) {
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
  token?: string
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

    const url = `${API_BASE_URL}${endpoint}${
      searchParams.toString() ? `?${searchParams.toString()}` : ""
    }`;

    console.log(`[API] GET ${endpoint}`);
    console.log(`[API] URL:`, url);

    const response = await fetch(url, {
      method: "GET",
      headers: token ? getAuthHeaders(token) : getDefaultHeaders(),
      cache: "no-store",
    });

    console.log(`[API] Response status:`, response.status);

    if (!response.ok) {
      const responseText = await response
        .text()
        .catch(() => "Unable to read response");
      console.log(`[API] Error response body:`, responseText);
      const apiError = new ApiError(
        `HTTP error! status: ${response.status}`,
        response.status,
        endpoint
      );
      // 404와 5xx 서버 에러를 제외하고만 로그 출력
      if (response.status !== 404 && response.status < 500) {
        console.error(`API GET Error (${endpoint}):`, apiError);
      }
      throw apiError;
    }

    const data = await parseJsonSafely<T>(response);
    console.log(`[API] Response data:`, data);
    return data;
  } catch (error) {
    // ApiError가 아니거나 404와 5xx가 아닌 경우에만 로그 출력
    if (
      !(error instanceof ApiError) ||
      (error.status !== 404 && error.status < 500)
    ) {
      console.error(`API GET Error (${endpoint}):`, error);
    }
    throw error;
  }
};

export const apiPost = async <T>(
  endpoint: string,
  data?: unknown,
  token?: string
): Promise<T> => {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const requestBody = data ? JSON.stringify(data) : undefined;

    console.log(`[API] POST ${endpoint}`);
    console.log(`[API] URL:`, url);
    console.log(`[API] Request Body:`, requestBody);
    console.log(`[API] Headers:`, token ? getAuthHeaders(token) : getDefaultHeaders());

    const response = await fetch(url, {
      method: "POST",
      headers: token ? getAuthHeaders(token) : getDefaultHeaders(),
      body: requestBody,
    });

    console.log(`[API] Response status:`, response.status);

    if (!response.ok) {
      const responseText = await response
        .text()
        .catch(() => "Unable to read response");
      console.log(`[API] Error response body:`, responseText);
      throw new ApiError(
        `HTTP error! status: ${response.status}`,
        response.status,
        endpoint
      );
    }

    const result = await parseJsonSafely<T>(response);
    console.log(`[API] Response data:`, result);
    return result;
  } catch (error) {
    console.error(`API POST Error (${endpoint}):`, error);
    throw error;
  }
};

export const apiPut = async <T>(
  endpoint: string,
  data?: unknown,
  token?: string
): Promise<T> => {
  try {
    const url = `${API_BASE_URL}${endpoint}`;

    const response = await fetch(url, {
      method: "PUT",
      headers: token ? getAuthHeaders(token) : getDefaultHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      throw new ApiError(
        `HTTP error! status: ${response.status}`,
        response.status,
        endpoint
      );
    }

    return await parseJsonSafely<T>(response);
  } catch (error) {
    console.error(`API PUT Error (${endpoint}):`, error);
    throw error;
  }
};

export const apiDelete = async <T>(
  endpoint: string,
  data?: unknown,
  token?: string
): Promise<T> => {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const requestBody = data ? JSON.stringify(data) : undefined;

    console.log(`[API] DELETE ${endpoint}`);
    console.log(`[API] URL:`, url);
    console.log(`[API] Request Body:`, requestBody);
    console.log(`[API] Headers:`, token ? getAuthHeaders(token) : getDefaultHeaders());

    const response = await fetch(url, {
      method: "DELETE",
      headers: token ? getAuthHeaders(token) : getDefaultHeaders(),
      body: requestBody,
    });

    console.log(`[API] Response status:`, response.status);

    if (!response.ok) {
      const responseText = await response
        .text()
        .catch(() => "Unable to read response");
      console.log(`[API] Error response body:`, responseText);
      throw new ApiError(
        `HTTP error! status: ${response.status}`,
        response.status,
        endpoint
      );
    }

    const result = await parseJsonSafely<T>(response);
    console.log(`[API] Response data:`, result);
    return result;
  } catch (error) {
    console.error(`API DELETE Error (${endpoint}):`, error);
    throw error;
  }
};
