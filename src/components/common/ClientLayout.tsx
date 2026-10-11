"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { Toaster } from "react-hot-toast";

import { MutationCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { reportError } from "@/utils/sentry";

import { ErrorBoundary } from "./ErrorBoundary";

type ClientLayoutProps = {
  children: ReactNode;
};
export const ClientLayout = ({ children }: ClientLayoutProps) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        mutationCache: new MutationCache({
          onError: (error, _variables, _context, mutation) => {
            reportError(error, {
              tags: { source: "react-query" },
              extra: { mutationKey: mutation.options.mutationKey },
            });
          },
        }),
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <Toaster />
      <ErrorBoundary>{children}</ErrorBoundary>
    </QueryClientProvider>
  );
};
