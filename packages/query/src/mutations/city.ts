"use client";

import type {
  AddCityRequest,
  AddCityResponse,
  DeleteCityRequest,
  DeleteCityResponse,
} from "@globber/shared/types/city";
import { useMutation } from "@tanstack/react-query";

import { useApi } from "../provider";

export type AddCityVariables = {
  request: AddCityRequest;
  token: string;
};

export type DeleteCityVariables = {
  request: DeleteCityRequest;
  token: string;
};

export const useAddCityMutation = () => {
  const api = useApi();
  return useMutation<AddCityResponse, Error, AddCityVariables>({
    mutationFn: ({ request, token }) => api.city.addCity(request, token),
  });
};

export const useDeleteCityMutation = () => {
  const api = useApi();
  return useMutation<DeleteCityResponse, Error, DeleteCityVariables>({
    mutationFn: ({ request, token }) => api.city.deleteCity(request.cityId, token),
  });
};
