/**
 * Diary API 응답 타입 정의
 */

import type { Emoji } from "./emoji";
import type { ImageTag } from "./imageMetadata";

export type DiaryCity = {
  cityId: number;
  cityName: string;
  countryName: string;
  lat: number;
  lng: number;
  countryCode: string;
};

export type DiaryPhotoTakenMonth =
  | {
      year: number;
      month: string;
      monthValue: number;
      leapYear: boolean;
    }
  | string;

export type DiaryPhoto = {
  photoId: number;
  url: string;
  photoCode: string;
  lat?: number;
  lng?: number;
  width?: number;
  height?: number;
  takenMonth?: DiaryPhotoTakenMonth;
  placeName?: string;
  tag?: ImageTag;
};

export type DiaryEmoji = Emoji;

export type DiaryData = {
  diaryId: number;
  city: DiaryCity;
  text: string;
  createdAt: string;
  updatedAt: string;
  photos: DiaryPhoto[];
  emojis: DiaryEmoji[];
};

export type DiaryDetailResponse = {
  status: string;
  data: DiaryData;
};

export type CreateDiaryResponse = {
  status: string;
  data: {
    diaryId: number;
    city: DiaryCity;
    text: string;
    createdAt: string;
    updatedAt: string;
    photos: DiaryPhoto[];
    emojis: DiaryEmoji[];
  };
};

/**
 * 클라이언트에서 사용하는 변환된 타입
 */
export type DiaryDetail = {
  id: string;
  city: string;
  country: string;
  countryCode: string;
  lat: number;
  lng: number;
  description: string;
  images: string[];
  reactions: Emoji[];
  date: string;
  location: string;
};

export type CreateDiaryPhotoParams = {
  photoId?: number;
  photoCode: string;
  lat?: number;
  lng?: number;
  width: number;
  height: number;
  takenMonth: string;
  tag?: ImageTag;
  placeName?: string;
};

export type CreateDiaryParams = {
  cityId: number;
  text?: string;
  photos: CreateDiaryPhotoParams[];
};
