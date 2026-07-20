"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

import { ErrorPageContent } from "@/components/common/ErrorPageContent";

type ErrorType = "401" | "404" | "500";

const ERROR_TYPES: readonly ErrorType[] = ["401", "404", "500"];

function isErrorType(value: string | null): value is ErrorType {
  return value !== null && ERROR_TYPES.includes(value as ErrorType);
}

function ErrorPageContentWrapper() {
  const searchParams = useSearchParams();
  const type = searchParams.get("type");
  // 알 수 없는 값(?type=abc 등)이 오면 서버 오류 화면으로 폴백
  const errorType: ErrorType = isErrorType(type) ? type : "500";

  return <ErrorPageContent errorType={errorType} />;
}

export default function ErrorPage() {
  return (
    <Suspense fallback={<ErrorPageContent errorType="500" />}>
      <ErrorPageContentWrapper />
    </Suspense>
  );
}
