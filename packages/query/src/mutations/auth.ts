"use client";

import { useMutation } from "@tanstack/react-query";

import { useApi } from "../provider";

type LogoutResponse = {
  token?: string;
};

export const useLogoutMutation = () => {
  const api = useApi();
  return useMutation<void, Error, LogoutResponse | void>({
    mutationFn: variables => api.auth.logout(variables?.token),
  });
};
