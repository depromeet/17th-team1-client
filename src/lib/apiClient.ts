import { env } from "@/config/env";

const API_BASE_URL = env.API_BASE_URL;

const isDev = process.env.NODE_ENV === "development";
const logger = {
  log: (...args: unknown[]) => isDev && console.log(...args),
  error: (...args: unknown[]) => isDev && console.error(...args),
};

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

/**
 * 클라이언트 사이드에서 401/500 에러를 자동으로 에러 페이지로 리다이렉트합니다.
 * 서버 사이드에서는 에러를 그대로 throw하여 서버 컴포넌트의 error.tsx에서 처리합니다.
 */
const handleGlobalError = (status: number, skipGlobalErrorHandling?: boolean): void => {
  // 전역 에러 처리 스킵 플래그가 있으면 리턴
  if (skipGlobalErrorHandling) return;

  // 클라이언트 사이드에서만 자동 리다이렉트
  if (typeof window === "undefined") return;

  if (status === 401) {
    window.location.href = "/error?type=401";
  } else if (status >= 500) {
    window.location.href = "/error?type=500";
  }
};

export const apiGet = async <T>(
  endpoint: string,
  params?: Record<string, string | number | undefined>,
  token?: string,
  options?: { skipGlobalErrorHandling?: boolean },
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

    logger.log(`[API] GET ${endpoint}`);
    logger.log(`[API] URL:`, url);

    const response = await fetch(url, {
      method: "GET",
      headers: token ? getAuthHeaders(token) : getDefaultHeaders(),
      cache: "no-store",
    });

    logger.log(`[API] Response status:`, response.status);

    if (!response.ok) {
      const responseText = await response.text().catch(() => "Unable to read response");
      logger.log(`[API] Error response body:`, responseText);
      const apiError = new ApiError(`HTTP error! status: ${response.status}`, response.status, endpoint);

      // 401/500 에러는 전역으로 처리 (클라이언트 사이드에서만 자동 리다이렉트)
      // 서버 사이드에서는 에러를 그대로 throw하여 서버 컴포넌트의 error.tsx에서 처리
      handleGlobalError(response.status, options?.skipGlobalErrorHandling);

      // 404와 5xx 서버 에러를 제외하고만 로그 출력
      if (response.status !== 404 && response.status < 500) {
        logger.error(`API GET Error (${endpoint}):`, apiError);
      }
      throw apiError;
    }

    const data = await parseJsonSafely<T>(response);
    logger.log(`[API] Response data:`, data);
    return data;
  } catch (error) {
    // ApiError가 아니거나 404와 5xx가 아닌 경우에만 로그 출력
    if (!(error instanceof ApiError) || (error.status !== 404 && error.status < 500)) {
      logger.error(`API GET Error (${endpoint}):`, error);
    }
    throw error;
  }
};

export const apiPost = async <T>(endpoint: string, data?: unknown, token?: string): Promise<T> => {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const requestBody = data ? JSON.stringify(data) : undefined;

    logger.log(`[API] POST ${endpoint}`);
    logger.log(`[API] URL:`, url);
    logger.log(`[API] Request Body:`, requestBody);
    logger.log(`[API] Headers:`, token ? getAuthHeaders(token) : getDefaultHeaders());

    const response = await fetch(url, {
      method: "POST",
      headers: token ? getAuthHeaders(token) : getDefaultHeaders(),
      body: requestBody,
      redirect: "manual", // ⭐ 리다이렉트를 수동으로 처리 (CORS 에러 방지)
    });

    logger.log(`[API] Response status:`, response.status);

    // ⭐ 리다이렉트 응답(3xx) 처리 - 서버가 카카오 로그인으로 리다이렉트하는 경우
    if (response.status >= 300 && response.status < 400) {
      const redirectUrl = response.headers.get("Location");
      if (redirectUrl && typeof window !== "undefined") {
        logger.log(`[API] Redirecting to: ${redirectUrl}`);
        // 브라우저가 직접 페이지를 이동하므로 CORS 문제 없음
        window.location.href = redirectUrl;
        throw new ApiError(`Redirecting to login`, 401, endpoint);
      }
    }

    if (!response.ok) {
      const responseText = await response.text().catch(() => "Unable to read response");
      logger.log(`[API] Error response body:`, responseText);

      throw new ApiError(`HTTP error! status: ${response.status}`, response.status, endpoint);
    }

    const result = await parseJsonSafely<T>(response);
    logger.log(`[API] Response data:`, result);
    return result;
  } catch (error) {
    logger.error(`API POST Error (${endpoint}):`, error);
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
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const responseText = await response.text();
        if (responseText) {
          errorMessage += ` - ${responseText}`;
        }
      } catch {
        // ignore parsing errors
      }
      throw new ApiError(errorMessage, response.status, endpoint);
    }

    return await parseJsonSafely<T>(response);
  } catch (error) {
    logger.error(`API PUT Error (${endpoint}):`, error);
    throw error;
  }
};

export const apiPatch = async <T>(endpoint: string, data?: unknown, token?: string): Promise<T> => {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const requestBody = data ? JSON.stringify(data) : undefined;

    logger.log(`[API] PATCH ${endpoint}`);
    logger.log(`[API] URL:`, url);
    logger.log(`[API] Request Body:`, requestBody);
    logger.log(`[API] Headers:`, token ? getAuthHeaders(token) : getDefaultHeaders());

    const response = await fetch(url, {
      method: "PATCH",
      headers: token ? getAuthHeaders(token) : getDefaultHeaders(),
      body: requestBody,
    });

    logger.log(`[API] Response status:`, response.status);

    if (!response.ok) {
      const responseText = await response.text().catch(() => "Unable to read response");
      logger.log(`[API] Error response body:`, responseText);

      throw new ApiError(`HTTP error! status: ${response.status}`, response.status, endpoint);
    }

    const result = await parseJsonSafely<T>(response);
    logger.log(`[API] Response data:`, result);
    return result;
  } catch (error) {
    logger.error(`API PATCH Error (${endpoint}):`, error);
    throw error;
  }
};

export const apiDelete = async <T>(endpoint: string, data?: unknown, token?: string): Promise<T> => {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const requestBody = data ? JSON.stringify(data) : undefined;

    logger.log(`[API] DELETE ${endpoint}`);
    logger.log(`[API] URL:`, url);
    logger.log(`[API] Request Body:`, requestBody);
    logger.log(`[API] Headers:`, token ? getAuthHeaders(token) : getDefaultHeaders());

    const response = await fetch(url, {
      method: "DELETE",
      headers: token ? getAuthHeaders(token) : getDefaultHeaders(),
      body: requestBody,
      redirect: "manual", // ⭐ 리다이렉트를 수동으로 처리 (CORS 에러 방지)
    });

    logger.log(`[API] Response status:`, response.status);

    // ⭐ 리다이렉트 응답(3xx) 처리 - 서버가 카카오 로그인으로 리다이렉트하는 경우
    if (response.status >= 300 && response.status < 400) {
      const redirectUrl = response.headers.get("Location");
      if (redirectUrl && typeof window !== "undefined") {
        logger.log(`[API] Redirecting to: ${redirectUrl}`);
        // 브라우저가 직접 페이지를 이동하므로 CORS 문제 없음
        window.location.href = redirectUrl;
        throw new ApiError(`Redirecting to login`, 401, endpoint);
      }
    }

    if (!response.ok) {
      const responseText = await response.text().catch(() => "Unable to read response");
      logger.log(`[API] Error response body:`, responseText);

      throw new ApiError(`HTTP error! status: ${response.status}`, response.status, endpoint);
    }

    const result = await parseJsonSafely<T>(response);
    logger.log(`[API] Response data:`, result);
    return result;
  } catch (error) {
    logger.error(`API DELETE Error (${endpoint}):`, error);
    throw error;
  }
};
