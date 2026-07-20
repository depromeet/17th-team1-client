"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

import { ErrorPageContent } from "@/components/common/ErrorPageContent";
import { DEFAULT_ERROR_TYPE, ERROR_TYPE_PARAM } from "@/constants/error";
import { toErrorType } from "@/utils/errorType";

function ErrorPageContentWrapper() {
  const searchParams = useSearchParams();
  const errorType = toErrorType(searchParams.get(ERROR_TYPE_PARAM));

  return <ErrorPageContent errorType={errorType} />;
}

export default function ErrorPage() {
  return (
    <Suspense fallback={<ErrorPageContent errorType={DEFAULT_ERROR_TYPE} />}>
      <ErrorPageContentWrapper />
    </Suspense>
  );
}
