"use client";

import { useMutation } from "@tanstack/react-query";

import { createMemberTravels, deleteMemberTravel } from "@/services/memberService";
import {
  CreateMemberTravelsRequest,
  CreateTravelRecordsResponse,
  DeleteMemberTravelRequest,
  DeleteTravelRecordsResponse,
} from "@/types/member";

export const useCreateMemberTravelsMutation = () => {
  return useMutation<CreateTravelRecordsResponse, Error, CreateMemberTravelsRequest>({
    mutationFn: data => {
      return createMemberTravels(data.cities);
    },
  });
};

export const useDeleteMemberTravelMutation = () => {
  return useMutation<DeleteTravelRecordsResponse, Error, DeleteMemberTravelRequest>({
    mutationFn: ({ travelRecord, token }) => deleteMemberTravel(travelRecord, token),
  });
};
