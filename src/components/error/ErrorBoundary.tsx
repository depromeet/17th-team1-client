"use client";

import React from "react";

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; retry: () => void }>;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // 에러 로깅 (개발 환경에서만)
    if (process.env.NODE_ENV === "development") {
      console.error("ErrorBoundary caught an error:", error, errorInfo);
    }
  }

  retry = () => {
    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
    });
  };

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return <FallbackComponent error={this.state.error} retry={this.retry} />;
    }

    return this.props.children;
  }
}

// 기본 에러 폴백 컴포넌트
const DefaultErrorFallback: React.FC<{ error?: Error; retry: () => void }> = ({ error, retry }) => {
  return (
    <div className="min-h-[400px] bg-black text-white flex flex-col items-center justify-center p-8 rounded-2xl border border-gray-800">
      <div className="text-6xl mb-4">⚠️</div>
      <h2 className="text-xl font-semibold mb-4">문제가 발생했습니다</h2>
      <p className="text-gray-400 mb-6 text-center max-w-md">예상치 못한 오류로 인해 이 부분을 표시할 수 없습니다.</p>
      {process.env.NODE_ENV === "development" && error && (
        <details className="mb-4 w-full max-w-2xl">
          <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-300">기술 세부사항 보기</summary>
          <pre className="mt-2 p-4 bg-gray-900 rounded text-xs overflow-auto max-h-32 text-red-400">
            {error.message}
            {error.stack}
          </pre>
        </details>
      )}
      <button
        onClick={retry}
        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl font-medium transition-colors"
      >
        다시 시도
      </button>
    </div>
  );
};

export { ErrorBoundary, DefaultErrorFallback };
