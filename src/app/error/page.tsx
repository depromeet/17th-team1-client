"use client";

import { useSearchParams } from "next/navigation";
import { ErrorPageContent } from "@/components/common/ErrorPageContent";

type ErrorType = "401" | "404" | "500";

export default function ErrorPage() {
  const searchParams = useSearchParams();
  const errorType = (searchParams.get("type") || "500") as ErrorType;

  return <ErrorPageContent errorType={errorType} />;
}
