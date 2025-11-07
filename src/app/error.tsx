"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ErrorPageContent } from "@/components/common/ErrorPageContent";
import type { ApiError } from "@/lib/apiClient";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorBoundary({ error }: ErrorPageProps) {
  const router = useRouter();

  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.error("Error boundary caught an error:", error);
    }

    // ApiError의 status 코드 확인
    const status =
      (error as ApiError).status || (error as { status?: number }).status;

    // 클라이언트 사이드에서 발생한 401/500 에러는 자동으로 에러 페이지로 리다이렉트
    // 서버 사이드는 서버 컴포넌트에서 이미 처리됨
    if (status === 401) {
      router.replace("/error?type=401");
    } else if (status && status >= 500) {
      router.replace("/error?type=500");
    }
  }, [error, router]);

  // ApiError의 status 코드 확인
  const status =
    (error as ApiError).status || (error as { status?: number }).status;

  // status에 따라 에러 타입 결정, 없으면 500
  let errorType: "401" | "404" | "500" = "500";
  if (status === 401) {
    errorType = "401";
  } else if (status === 404) {
    errorType = "404";
  } else if (status && status >= 500) {
    errorType = "500";
  }

  return <ErrorPageContent errorType={errorType} />;
}
