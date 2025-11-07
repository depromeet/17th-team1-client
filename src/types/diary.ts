/**
 * Diary API 응답 타입 정의
 */

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

export type DiaryEmoji = {
  emojiId: number;
  emoji: string;
  count: number;
};

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
  reactions: Array<{ emoji: string; count: number }>;
  date: string;
  location: string;
};
