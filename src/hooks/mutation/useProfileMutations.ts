"use client";

import { useMutation } from "@tanstack/react-query";
import type { ProfileData, S3UploadUrlParams } from "@/types/member";
import { getS3UploadUrl, uploadAndUpdateProfile, withdrawMember } from "@/services/profileService";

type GetS3UploadUrlRequest = {
  uploadData: S3UploadUrlParams;
  token?: string;
};

export const useGetS3UploadUrlMutation = () => {
  return useMutation<{ presignedUrl: string; s3Key: string }, Error, GetS3UploadUrlRequest>({
    mutationFn: ({ uploadData, token }) => getS3UploadUrl(uploadData, token),
  });
};

type UploadAndUpdateProfileRequest = {
  nickname: string;
  memberId: number;
  imageFile?: File;
  token?: string;
};

export const useUploadAndUpdateProfileMutation = () => {
  return useMutation<ProfileData, Error, UploadAndUpdateProfileRequest>({
    mutationFn: ({ nickname, memberId, imageFile, token }) =>
      uploadAndUpdateProfile(nickname, memberId, imageFile, token),
  });
};

type WithdrawMemberRequest = {
  token?: string;
};

export const useWithdrawMemberMutation = () => {
  return useMutation<void, Error, WithdrawMemberRequest | void>({
    mutationFn: response => withdrawMember(response?.token),
  });
};
