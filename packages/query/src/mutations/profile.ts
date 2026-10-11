"use client";

import type {
  GetS3UploadUrlRequest,
  ProfileData,
  UploadAndUpdateProfileRequest,
  WithdrawMemberRequest,
} from "@globber/shared/types/member";
import { useMutation } from "@tanstack/react-query";

import { useApi } from "../provider";

export const useGetS3UploadUrlMutation = () => {
  const api = useApi();
  return useMutation<{ presignedUrl: string; s3Key: string }, Error, GetS3UploadUrlRequest>({
    mutationFn: ({ uploadData, token }) => api.profile.getS3UploadUrl(uploadData, token),
  });
};

export const useUploadAndUpdateProfileMutation = () => {
  const api = useApi();
  return useMutation<ProfileData, Error, UploadAndUpdateProfileRequest>({
    mutationFn: ({ nickname, memberId, imageFile, token }) =>
      api.profile.uploadAndUpdateProfile(nickname, memberId, imageFile, token),
  });
};

export const useWithdrawMemberMutation = () => {
  const api = useApi();
  return useMutation<void, Error, WithdrawMemberRequest | void>({
    mutationFn: request => api.profile.withdrawMember(request?.token),
  });
};
