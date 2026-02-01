"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import type { ReactNode } from "react";
import { Toaster } from "react-hot-toast";
import { ErrorBoundary } from "./ErrorBoundary";

type ClientLayoutProps = {
  children: ReactNode;
};
export const ClientLayout = ({ children }: ClientLayoutProps) => {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        {children}
        <Toaster />
      </ErrorBoundary>
    </QueryClientProvider>
  );
};
