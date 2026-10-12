"use client";

import {
  CreateMemberTravelsRequest,
  CreateTravelRecordsResponse,
  DeleteMemberTravelRequest,
  DeleteTravelRecordsResponse,
} from "@globber/shared/types/member";
import { useMutation } from "@tanstack/react-query";

import { useApi } from "../provider";

export const useCreateMemberTravelsMutation = () => {
  const api = useApi();
  return useMutation<CreateTravelRecordsResponse, Error, CreateMemberTravelsRequest>({
    mutationFn: data => {
      return api.member.createMemberTravels(data.cities);
    },
  });
};

export const useDeleteMemberTravelMutation = () => {
  const api = useApi();
  return useMutation<DeleteTravelRecordsResponse, Error, DeleteMemberTravelRequest>({
    mutationFn: ({ travelRecord, token }) => api.member.deleteMemberTravel(travelRecord, token),
  });
};
