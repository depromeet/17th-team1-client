"use client";

import { useMutation } from "@tanstack/react-query";
import type { ProfileData, S3UploadUrlParams } from "@/types/member";
import { getS3UploadUrl, uploadAndUpdateProfile, withdrawMember } from "@/services/profileService";

type GetS3UploadUrlResponse = {
  uploadData: S3UploadUrlParams;
  token?: string;
};

export const useGetS3UploadUrlMutation = () => {
  return useMutation<{ presignedUrl: string; s3Key: string }, Error, GetS3UploadUrlResponse>({
    mutationFn: ({ uploadData, token }) => getS3UploadUrl(uploadData, token),
  });
};

type UploadAndUpdateProfileResponse = {
  nickname: string;
  memberId: number;
  imageFile?: File;
  token?: string;
};

export const useUploadAndUpdateProfileMutation = () => {
  return useMutation<ProfileData, Error, UploadAndUpdateProfileResponse>({
    mutationFn: ({ nickname, memberId, imageFile, token }) =>
      uploadAndUpdateProfile(nickname, memberId, imageFile, token),
  });
};

type WithdrawMemberResponse = {
  token?: string;
};

export const useWithdrawMemberMutation = () => {
  return useMutation<void, Error, WithdrawMemberResponse | void>({
    mutationFn: response => withdrawMember(response?.token),
  });
};
