"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { Toaster } from "react-hot-toast";

import { ApiProvider } from "@globber/query";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { api } from "@/lib/api";

import { ErrorBoundary } from "./ErrorBoundary";

type ClientLayoutProps = {
  children: ReactNode;
};
export const ClientLayout = ({ children }: ClientLayoutProps) => {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <ApiProvider api={api}>
        <Toaster />
        <ErrorBoundary>{children}</ErrorBoundary>
      </ApiProvider>
    </QueryClientProvider>
  );
};
