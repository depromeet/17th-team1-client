"use client";

import type {
  AddDiaryPhotoRequest,
  CreateDiaryRequest,
  DeleteDiaryPhotoRequest,
  DeleteDiaryRequest,
  DiaryPhoto,
  UpdateDiaryRequest,
  UploadTravelPhotoRequest,
} from "@globber/shared/types/diary";
import { useMutation } from "@tanstack/react-query";

import { useApi } from "../provider";

export const useUploadTravelPhotoMutation = () => {
  const api = useApi();
  return useMutation<string, Error, UploadTravelPhotoRequest>({
    mutationFn: ({ file, token }) => api.diary.uploadTravelPhoto(file, token),
  });
};

export const useCreateDiaryMutation = () => {
  const api = useApi();
  return useMutation<number, Error, CreateDiaryRequest>({
    mutationFn: ({ params, token }) => api.diary.createDiary(params, token),
  });
};

export const useDeleteDiaryMutation = () => {
  const api = useApi();
  return useMutation<void, Error, DeleteDiaryRequest>({
    mutationFn: ({ diaryId, token }) => api.diary.deleteDiary(diaryId, token),
  });
};

export const useDeleteDiaryPhotoMutation = () => {
  const api = useApi();
  return useMutation<void, Error, DeleteDiaryPhotoRequest>({
    mutationFn: ({ diaryId, photoId, token }) => api.diary.deleteDiaryPhoto(diaryId, photoId, token),
  });
};

export const useAddDiaryPhotoMutation = () => {
  const api = useApi();
  return useMutation<DiaryPhoto, Error, AddDiaryPhotoRequest>({
    mutationFn: ({ diaryId, photo, token }) => api.diary.addDiaryPhoto(diaryId, photo, token),
  });
};

export const useUpdateDiaryMutation = () => {
  const api = useApi();
  return useMutation<void, Error, UpdateDiaryRequest>({
    mutationFn: ({ diaryId, params, token }) => api.diary.updateDiary(diaryId, params, token),
  });
};
