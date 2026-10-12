"use client";

import { createContext, type ReactNode, useContext } from "react";

import type { Api } from "@globber/api";

const ApiContext = createContext<Api | null>(null);

type ApiProviderProps = {
  /** 플랫폼(웹/앱)별 어댑터로 생성한 `createApi()` 결과 */
  api: Api;
  children: ReactNode;
};

export const ApiProvider = ({ api, children }: ApiProviderProps) => {
  return <ApiContext.Provider value={api}>{children}</ApiContext.Provider>;
};

export const useApi = (): Api => {
  const api = useContext(ApiContext);

  if (!api) {
    throw new Error("useApi는 ApiProvider 안에서만 사용할 수 있습니다.");
  }

  return api;
};
