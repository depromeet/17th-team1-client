import { api } from "@/lib/api";

export const {
  uploadTravelPhoto,
  createDiary,
  getDiaryDetail,
  getDiariesByUuid,
  deleteDiary,
  deleteDiaryPhoto,
  addDiaryPhoto,
  getDiariesList,
  updateDiary,
} = api.diary;
