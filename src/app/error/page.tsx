"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { ErrorPageContent } from "@/components/common/ErrorPageContent";

type ErrorType = "401" | "404" | "500";

function ErrorPageContentWrapper() {
  const searchParams = useSearchParams();
  const errorType = (searchParams.get("type") || "500") as ErrorType;

  return <ErrorPageContent errorType={errorType} />;
}

export default function ErrorPage() {
  return (
    <Suspense fallback={<ErrorPageContent errorType="500" />}>
      <ErrorPageContentWrapper />
    </Suspense>
  );
}
