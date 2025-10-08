"use client";

import type { ReactNode } from "react";
import { Toaster } from "react-hot-toast";
import { ErrorBoundary } from "./ErrorBoundary";

type ClientLayoutProps = {
  children: ReactNode;
};

export const ClientLayout = ({ children }: ClientLayoutProps) => {
  return (
    <ErrorBoundary>
      {children}
      <Toaster />
    </ErrorBoundary>
  );
};
