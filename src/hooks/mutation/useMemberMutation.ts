import { createMemberTravels, deleteMemberTravel } from "@/services/memberService";
import {
  CreateMemberTravelsRequest,
  CreateTravelRecordsResponse,
  DeleteMemberTravelRequest,
  DeleteTravelRecordsResponse,
} from "@/types/member";
import { useMutation } from "@tanstack/react-query";

export const useCreateMemberTravelsMutation = () => {
  return useMutation<CreateTravelRecordsResponse, Error, CreateMemberTravelsRequest>({
    mutationFn: (data: CreateMemberTravelsRequest) => {
      return createMemberTravels(data.cities);
    },
  });
};

export const useDeleteMemberTravelMutation = () => {
  return useMutation<DeleteTravelRecordsResponse, Error, DeleteMemberTravelRequest>({
    mutationFn: ({ travelRecord, token }) => deleteMemberTravel(travelRecord, token),
  });
};
