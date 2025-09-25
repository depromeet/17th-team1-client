"use client";

import type React from "react";
import { ErrorBoundary } from "./ErrorBoundary";

interface GlobeErrorFallbackProps {
  error?: Error;
  retry: () => void;
}

const GlobeErrorFallback: React.FC<GlobeErrorFallbackProps> = ({ error, retry }) => {
  const isNetworkError =
    error?.message.includes("fetch") || error?.message.includes("network") || error?.message.includes("HTTP error");

  return (
    <div
      className="flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-black rounded-full"
      style={{ width: 512, height: 512 }}
    >
      <div className="text-center p-8">
        <div className="text-6xl mb-4">🌍</div>
        <h2 className="text-xl font-semibold text-white mb-2">지구본을 로드할 수 없습니다</h2>
        <p className="text-gray-400 text-sm mb-6 max-w-xs">
          {isNetworkError ? "인터넷 연결을 확인하고 다시 시도해 주세요" : "일시적인 문제가 발생했습니다"}
        </p>
        <button
          onClick={retry}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-sm font-medium transition-colors"
        >
          다시 시도
        </button>
      </div>
    </div>
  );
};

interface GlobeErrorBoundaryProps {
  children: React.ReactNode;
}

export const GlobeErrorBoundary: React.FC<GlobeErrorBoundaryProps> = ({ children }) => {
  return <ErrorBoundary fallback={GlobeErrorFallback}>{children}</ErrorBoundary>;
};
