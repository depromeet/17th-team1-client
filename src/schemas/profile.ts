import { z } from "zod";

// 프로필 편집 폼 검증 상수
export const PROFILE_VALIDATION = {
  MAX_NICKNAME_LENGTH: 10,
  MAX_IMAGE_SIZE_MB: 5,
  MAX_IMAGE_SIZE_BYTES: 5 * 1024 * 1024,
  ALLOWED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/gif", "image/webp", "image/heic", "image/heif"],
} as const;

const isAllowedImageType = (type: string): type is (typeof PROFILE_VALIDATION.ALLOWED_IMAGE_TYPES)[number] =>
  PROFILE_VALIDATION.ALLOWED_IMAGE_TYPES.includes(type as (typeof PROFILE_VALIDATION.ALLOWED_IMAGE_TYPES)[number]);

// 닉네임 스키마
export const nicknameSchema = z
  .string()
  .min(1, { message: "닉네임을 입력해주세요." })
  .max(PROFILE_VALIDATION.MAX_NICKNAME_LENGTH, {
    message: `닉네임은 ${PROFILE_VALIDATION.MAX_NICKNAME_LENGTH}자 이하여야 합니다.`,
  });

// 이미지 파일 스키마 (클라이언트 사이드 검증용)
export const imageFileSchema = z
  .custom<File>(val => val instanceof File, {
    message: "유효한 파일이 아닙니다.",
  })
  .refine(({ size }) => size <= PROFILE_VALIDATION.MAX_IMAGE_SIZE_BYTES, {
    message: `이미지 크기는 ${PROFILE_VALIDATION.MAX_IMAGE_SIZE_MB}MB 이하여야 합니다.`,
  })
  .refine(({ type }) => isAllowedImageType(type), {
    message: "지원되는 이미지 형식: JPEG, PNG, GIF, WebP, HEIC, HEIF",
  })
  .optional();

// 프로필 편집 폼 스키마
export const editProfileSchema = z.object({
  nickname: nicknameSchema,
  imageFile: imageFileSchema,
});

export type EditProfileFormData = z.infer<typeof editProfileSchema>;

// 파일 검증 헬퍼 함수 (FileReader 사용 전 빠른 검증)
export const validateImageFile = ({ type, size }: File): { isValid: boolean; error?: string } => {
  if (size > PROFILE_VALIDATION.MAX_IMAGE_SIZE_BYTES)
    return {
      isValid: false,
      error: `이미지 크기는 ${PROFILE_VALIDATION.MAX_IMAGE_SIZE_MB}MB 이하여야 합니다.`,
    };

  if (!isAllowedImageType(type))
    return {
      isValid: false,
      error: "이미지 파일만 업로드 가능합니다.",
    };

  return { isValid: true };
};
