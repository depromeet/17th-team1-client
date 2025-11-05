"use client";

import type { ReactNode } from "react";
import { ErrorBoundary } from "./ErrorBoundary";
import { ToastContainer } from "./Toast";

type ClientLayoutProps = {
  children: ReactNode;
};

export const ClientLayout = ({ children }: ClientLayoutProps) => {
  return (
    <ErrorBoundary>
      {children}
      <ToastContainer />
    </ErrorBoundary>
  );
};
