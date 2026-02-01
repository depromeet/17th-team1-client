import { createMemberTravels, deleteMemberTravel } from "@/services/memberService";
import { City } from "@/types/city";
import { CreateTravelRecordsResponse, DeleteTravelRecord, DeleteTravelRecordsResponse } from "@/types/member";
import { useMutation } from "@tanstack/react-query";

type CreateMemberTravelsRequest = {
  cities: City[];
};

export const useCreateMemberTravelsMutation = () => {
  return useMutation<CreateTravelRecordsResponse, Error, CreateMemberTravelsRequest>({
    mutationFn: (data: CreateMemberTravelsRequest) => {
      return createMemberTravels(data.cities);
    },
  });
};

type DeleteMemberTravelRequest = {
  travelRecord: DeleteTravelRecord;
  token?: string;
};

export const useDeleteMemberTravelMutation = () => {
  return useMutation<DeleteTravelRecordsResponse, Error, DeleteMemberTravelRequest>({
    mutationFn: ({ travelRecord, token }) => deleteMemberTravel(travelRecord, token),
  });
};
