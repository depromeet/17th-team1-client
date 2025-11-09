/**
 * Diary API 응답 타입 정의
 */

import type { Emoji } from "./emoji";

export type DiaryCity = {
  cityId: number;
  cityName: string;
  countryName: string;
  lat: number;
  lng: number;
  countryCode: string;
};

export type DiaryPhoto = {
  photoId: number;
  url: string;
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

export type DiariesListResponse = {
  status: string;
  data: {
    diaryResponses: {
      city: DiaryCity;
      /* 충돌 우려하여 별도로 타입 작성. 추후 공통 타입으로 변경 */
      diaries: {
        diaryId: number;
        city: DiaryCity;
        text: string;
        createdAt: string;
        updatedAt: string;
        photos: {
          photoId: number;
          photoCode: string;
          lat: number;
          lng: number;
          width: number;
          height: number;
          takenMonth: string;
          placeName: string;
          tag: string;
        }[];
        emojis: DiaryEmoji[];
      }[];
    }[];
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
