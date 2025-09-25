// 클러스터링 관련 에러 처리 유틸리티

export class ClusteringError extends Error {
  constructor(
    message: string,
    public cause?: Error,
  ) {
    super(message);
    this.name = "ClusteringError";
  }
}

export const withErrorHandling = <T extends (...args: any[]) => any>(fn: T, errorMessage: string): T => {
  return ((...args: Parameters<T>) => {
    try {
      return fn(...args);
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error(`${errorMessage}:`, error);
      }
      throw new ClusteringError(errorMessage, error instanceof Error ? error : undefined);
    }
  }) as T;
};

export const safeCallback = <T extends (...args: any[]) => any>(
  callback: T | undefined,
  fallback?: T,
): T | (() => void) => {
  return ((...args: Parameters<T>) => {
    try {
      return callback?.(...args);
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Callback error:", error);
      }
      return fallback?.(...args);
    }
  }) as T | (() => void);
};
